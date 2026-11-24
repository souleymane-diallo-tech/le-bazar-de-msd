import { z } from "zod";
export type NotificationMode = "disabled" | "simulated" | "meta";
export function notificationMode(
  env: Record<string, string | undefined> = process.env,
): NotificationMode {
  const mode = env.WHATSAPP_MODE;
  return mode === "meta" || mode === "simulated" ? mode : "disabled";
}
export function metaConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const result = z
    .object({
      WHATSAPP_ACCESS_TOKEN: z.string().min(20),
      WHATSAPP_PHONE_NUMBER_ID: z.string().regex(/^\d+$/),
      WHATSAPP_GRAPH_VERSION: z.string().regex(/^v\d+\.\d+$/),
      WHATSAPP_TEMPLATE_NAME: z.string().regex(/^[a-z0-9_]+$/),
      WHATSAPP_CUSTOMER_TEMPLATE_NAME: z
        .string()
        .regex(/^[a-z0-9_]+$/)
        .optional(),
      WHATSAPP_TEMPLATE_LANGUAGE: z.string().regex(/^[a-z]{2}(?:_[A-Z]{2})?$/),
      WHATSAPP_RECIPIENT_CONSENT: z.literal("confirmed"),
      APP_URL: z.url().refine((v) => new URL(v).protocol === "https:"),
    })
    .safeParse(env);
  if (!result.success) throw new Error("WHATSAPP_CONFIGURATION_REQUIRED");
  return result.data;
}
export const notificationLabels = {
  PENDING: "En attente",
  PROCESSING: "Envoi en cours",
  SENT: "Envoyée à WhatsApp",
  DELIVERED: "Livrée",
  READ: "Lue",
  FAILED: "Échec",
  UNCERTAIN: "À vérifier avant renvoi",
  SIMULATED: "Simulation réussie, aucun message envoyé",
  CANCELLED: "Annulée",
};

// Server-only allowlist for explicitly verified demo recipients; never expose its values in UI.
export function customerTestRecipients(
  env: Record<string, string | undefined> = process.env,
): string[] {
  if (env.WHATSAPP_CUSTOMER_ENABLED !== "true") return [];
  return (env.WHATSAPP_CUSTOMER_TEST_RECIPIENTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[1-9]\d{7,14}$/.test(s));
}
export const CUSTOMER_CONSENT_VERSION = "order-confirmation-v1";
