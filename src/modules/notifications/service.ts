import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { publicSettingsFromJson } from "@/modules/settings/rules";
import type { NotificationMode } from "./config";
import type { Sender } from "./provider";

export async function recordNotification(
  tx: Prisma.TransactionClient,
  orderId: string,
  mode: NotificationMode,
) {
  if (mode === "disabled") return;
  const settings = await tx.storeSettings.findUnique({
    where: { id: "store" },
  });
  const recipient = publicSettingsFromJson(
    settings?.contacts,
    settings?.socialLinks,
  ).whatsapp;
  await tx.orderNotification.create({
    data: {
      orderId,
      recipient,
      mode,
      ...(!recipient
        ? { state: "FAILED", errorCode: "RECIPIENT_REQUIRED" }
        : {}),
    },
  });
}

export async function recoverExpiredLeases(db: PrismaClient, now = new Date()) {
  // A crashed sender might have already reached Meta. Never automatically resend it.
  await db.orderNotification.updateMany({
    where: { state: "PROCESSING", leaseUntil: { lt: now } },
    data: {
      state: "UNCERTAIN",
      errorCode: "WORKER_OUTCOME_UNKNOWN",
      leaseUntil: null,
    },
  });
}

export async function processNotification(
  db: PrismaClient,
  id: string,
  mode: NotificationMode,
  sender: Sender,
) {
  if (mode === "disabled") return;
  const now = new Date(),
    attemptId = randomUUID();
  const claimed = await db.orderNotification.updateMany({
    where: {
      id,
      state: "PENDING",
      mode,
      nextAttemptAt: { lte: now },
      attempts: { lt: 5 },
    },
    data: {
      state: "PROCESSING",
      attemptId,
      attempts: { increment: 1 },
      leaseUntil: new Date(now.getTime() + 120000),
      errorCode: null,
    },
  });
  if (!claimed.count) {
    const current = await db.orderNotification.findUnique({ where: { id } });
    if (current?.state === "PENDING" && current.mode === mode)
      throw new Error("NOTIFICATION_NOT_DUE");
    return;
  }
  const record = await db.orderNotification.findUniqueOrThrow({
    where: { id },
    include: { order: { include: { items: true } } },
  });
  const finish = (data: Prisma.OrderNotificationUpdateManyMutationInput) =>
    db.orderNotification.updateMany({
      where: { id, attemptId, state: "PROCESSING" },
      data: { ...data, leaseUntil: null },
    });
  if (record.order.status === "CANCELLED") {
    await finish({ state: "CANCELLED" });
    return;
  }
  const settings = await db.storeSettings.findUnique({
    where: { id: "store" },
  });
  const currentRecipient = publicSettingsFromJson(
    settings?.contacts,
    settings?.socialLinks,
  ).whatsapp;
  if (!record.recipient || currentRecipient !== record.recipient) {
    await finish({ state: "FAILED", errorCode: "RECIPIENT_CHANGED" });
    return;
  }
  if (mode === "simulated") {
    await finish({ state: "SIMULATED" });
    return;
  }
  const address = record.order.addressSnapshot as Record<string, unknown>;
  const result = await sender({
    attemptId,
    recipient: record.recipient,
    orderId: record.orderId,
    reference: record.order.reference,
    totalXof: record.order.totalXof,
    isDemo: record.order.isDemo,
    quantity: record.order.items.reduce((n, i) => n + i.quantity, 0),
    zone:
      typeof address.zoneName === "string" ? address.zoneName : "À consulter",
  }).catch(() => ({
    kind: "uncertain" as const,
    code: "SENDER_OUTCOME_UNKNOWN",
  }));
  if (result.kind === "accepted") {
    await finish({ state: "SENT", providerMessageId: result.messageId });
    return;
  }
  if (result.kind === "retry" && record.attempts < 5) {
    await finish({
      state: "PENDING",
      errorCode: result.code,
      nextAttemptAt: new Date(
        Date.now() + Math.min(300, 30 * 2 ** (record.attempts - 1)) * 1000,
      ),
      queuedAt: null,
    });
    throw new Error("NOTIFICATION_RETRY");
  }
  await finish({
    state: result.kind === "uncertain" ? "UNCERTAIN" : "FAILED",
    errorCode: result.code,
  });
}

export type StatusEvent = {
  messageId: string;
  attemptId?: string;
  recipient: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: Date;
};
export async function applyStatus(
  db: PrismaClient,
  event: StatusEvent,
  attempt = 0,
): Promise<void> {
  const record = await db.orderNotification.findFirst({
    where: {
      mode: "meta",
      recipient: event.recipient,
      OR: [
        { providerMessageId: event.messageId },
        ...(event.attemptId ? [{ attemptId: event.attemptId }] : []),
      ],
    },
  });
  if (
    !record ||
    (record.providerMessageId && record.providerMessageId !== event.messageId)
  )
    return;
  const allowed =
    event.status === "read"
      ? ["PROCESSING", "UNCERTAIN", "SENT", "DELIVERED", "FAILED"]
      : event.status === "delivered"
        ? ["PROCESSING", "UNCERTAIN", "SENT", "FAILED"]
        : event.status === "sent"
          ? ["PROCESSING", "UNCERTAIN"]
          : ["PROCESSING", "UNCERTAIN", "SENT"];
  if (!allowed.includes(record.state)) return;
  const changed = await db.orderNotification.updateMany({
    where: { id: record.id, state: record.state, attemptId: record.attemptId },
    data: {
      state:
        event.status === "read"
          ? "READ"
          : event.status === "delivered"
            ? "DELIVERED"
            : event.status === "sent"
              ? "SENT"
              : "FAILED",
      providerMessageId: event.messageId,
      leaseUntil: null,
      errorCode: event.status === "failed" ? "DELIVERY_FAILED" : null,
      ...(["delivered", "read"].includes(event.status)
        ? { deliveredAt: event.timestamp }
        : {}),
    },
  });
  if (!changed.count) {
    if (attempt >= 3) throw new Error("WEBHOOK_CONCURRENT_UPDATE");
    await applyStatus(db, event, attempt + 1);
  }
}
