import "server-only";
import { getEnvironment } from "@/lib/env";
import {
  notificationMode,
  customerTestRecipients,
} from "@/modules/notifications/config";
export function getOrderPolicy() {
  const env = getEnvironment();
  return {
    enabled: env.CHECKOUT_MODE === "demo" && env.APP_ENV !== "production",
    secret: env.BETTER_AUTH_SECRET,
    notificationMode: notificationMode(),
    customerRecipients: customerTestRecipients(),
  };
}
