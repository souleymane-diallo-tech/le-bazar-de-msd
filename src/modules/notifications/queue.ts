import { QueueClient } from "@vercel/queue";
import type { PrismaClient } from "@/generated/prisma/client";
import { notificationMode } from "./config";
import { processNotification, recoverExpiredLeases } from "./service";
import { sendMeta } from "./provider";
export const notificationQueue = new QueueClient({ region: "fra1" });
export async function dispatchNotifications(db: PrismaClient) {
  const mode = notificationMode();
  if (mode === "disabled") return;
  await recoverExpiredLeases(db);
  const now = new Date();
  const rows = await db.orderNotification.findMany({
    where: {
      state: "PENDING",
      mode,
      nextAttemptAt: { lte: now },
      OR: [
        { queuedAt: null },
        { queuedAt: { lt: new Date(now.getTime() - 300000) } },
      ],
    },
    take: 20,
    orderBy: { createdAt: "asc" },
  });
  for (const row of rows) {
    if (!process.env.VERCEL) {
      await processNotification(db, row.id, mode, sendMeta);
      continue;
    }
    await notificationQueue.send(
      "order-whatsapp",
      { id: row.id },
      {
        retentionSeconds: 86400,
        idempotencyKey: `${row.id}:${row.attempts}:${Math.floor(now.getTime() / 300000)}`,
      },
    );
    await db.orderNotification.updateMany({
      where: { id: row.id, state: "PENDING" },
      data: { queuedAt: now },
    });
  }
}
