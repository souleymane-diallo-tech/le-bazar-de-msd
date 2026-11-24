import { z } from "zod";
import { getDb } from "@/lib/db";
import { notificationQueue } from "@/modules/notifications/queue";
import { processNotification } from "@/modules/notifications/service";
import { notificationMode } from "@/modules/notifications/config";
import { sendMeta } from "@/modules/notifications/provider";
export const maxDuration = 60;
const callback = notificationQueue.handleCallback(
  async (message) => {
    try {
      const { id } = z
        .object({ id: z.string().min(1).max(100) })
        .parse(message);
      await processNotification(getDb(), id, notificationMode(), sendMeta);
    } catch {
      // The queue SDK logs failures; never forward database/provider details.
      throw new Error("NOTIFICATION_WORKER_RETRY");
    }
  },
  {
    retry: (_error, metadata) => ({
      afterSeconds: Math.min(
        300,
        30 * 2 ** Math.min(metadata.deliveryCount, 4),
      ),
    }),
  },
);
export async function POST(request: Request) {
  return callback(request);
}
