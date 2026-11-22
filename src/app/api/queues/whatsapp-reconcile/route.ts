import { getDb } from "@/lib/db";
import {
  notificationQueue,
  dispatchNotifications,
} from "@/modules/notifications/queue";
export const maxDuration = 60;
const callback = notificationQueue.handleCallback(
  async () => {
    try {
      await dispatchNotifications(getDb());
    } catch {
      throw new Error("NOTIFICATION_DISPATCH_RETRY");
    }
  },
  { retry: () => ({ afterSeconds: 60 }) },
);
export async function POST(request: Request) {
  return callback(request);
}
