import type { PrismaClient } from "@/generated/prisma/client";
import { authorize, audit, serial } from "@/modules/orders/service";
import { CommerceError } from "@/modules/orders/rules";
import { notificationMode } from "./config";
export async function retryNotification(
  db: PrismaClient,
  actorId: string,
  id: string,
) {
  await serial(db, async (tx) => {
    await authorize(tx, actorId, "settings:write");
    const n = await tx.orderNotification.findUnique({
      where: { id },
      include: { order: true },
    });
    // Uncertain sends require provider reconciliation, never a blind manual resend.
    if (
      !n ||
      n.state !== "FAILED" ||
      n.providerMessageId ||
      n.mode !== notificationMode() ||
      n.order.status === "CANCELLED"
    )
      throw new CommerceError("CONFLICT");
    await tx.orderNotification.update({
      where: { id },
      data: {
        state: "PENDING",
        attempts: 0,
        attemptId: null,
        errorCode: null,
        nextAttemptAt: new Date(),
        queuedAt: null,
      },
    });
    await audit(tx, actorId, "notification.retry", "OrderNotification", id, {
      previousState: n.state,
    });
  });
}
