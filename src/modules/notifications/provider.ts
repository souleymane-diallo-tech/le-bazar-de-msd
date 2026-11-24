import { metaConfig } from "./config";
export type Message = {
  audience?: "manager" | "customer";
  itemsSummary?: string;
  attemptId: string;
  recipient: string;
  orderId: string;
  reference: string;
  totalXof: number;
  quantity: number;
  zone: string;
  isDemo: boolean;
};
export type SendResult =
  | { kind: "accepted"; messageId: string }
  | { kind: "retry" | "failed" | "uncertain"; code: string };
export type Sender = (message: Message) => Promise<SendResult>;
// Template body parameters: reference, quantity, total, zone, protected admin URL.
// No contact name, delivery address or private receipt token is sent to Meta.
export function templatePayload(
  message: Message,
  config: ReturnType<typeof metaConfig>,
) {
  const customer = message.audience === "customer";
  if (customer && !config.WHATSAPP_CUSTOMER_TEMPLATE_NAME)
    throw new Error("CUSTOMER_TEMPLATE_REQUIRED");
  const summary = (
    message.itemsSummary ?? "Articles de votre commande"
  ).replace(/\s+/g, " ");
  const params = customer
    ? [
        `${message.isDemo ? "TEST · " : ""}${message.reference}`,
        summary.length > 900
          ? summary.slice(0, 860) +
            "… (suite dans votre confirmation sur la boutique)"
          : summary,
        `${message.totalXof} FCFA`,
      ]
    : [
        `${message.isDemo ? "TEST · " : ""}${message.reference}`,
        String(message.quantity),
        `${message.totalXof} FCFA`,
        message.zone.slice(0, 100),
        new URL(
          `/admin/commandes/${encodeURIComponent(message.orderId)}`,
          config.APP_URL,
        ).href,
      ];
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: message.recipient,
    type: "template",
    biz_opaque_callback_data: message.attemptId,
    template: {
      name: customer
        ? config.WHATSAPP_CUSTOMER_TEMPLATE_NAME!
        : config.WHATSAPP_TEMPLATE_NAME,
      language: { code: config.WHATSAPP_TEMPLATE_LANGUAGE },
      components: [
        {
          type: "body",
          parameters: params.map((text) => ({ type: "text", text })),
        },
      ],
    },
  };
}
export const sendMeta: Sender = async (message) => {
  let config: ReturnType<typeof metaConfig>;
  let payload: ReturnType<typeof templatePayload>;
  try {
    config = metaConfig();
    payload = templatePayload(message, config);
  } catch {
    return { kind: "failed", code: "CONFIGURATION_REQUIRED" };
  }
  try {
    const response = await fetch(
      `https://graph.facebook.com/${config.WHATSAPP_GRAPH_VERSION}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      },
    );
    // Never expose provider error bodies, tokens or recipient numbers in logs.
    const body = await response.json().catch(() => null);
    if (response.ok && typeof body?.messages?.[0]?.id === "string")
      return { kind: "accepted", messageId: body.messages[0].id };
    if (response.status === 429) return { kind: "retry", code: "RATE_LIMIT" };
    if (response.status >= 500 || response.ok)
      return { kind: "uncertain", code: "PROVIDER_RESPONSE_UNCERTAIN" };
    const code =
      typeof body?.error?.code === "number"
        ? `META_${body.error.code}`
        : "PROVIDER_REJECTED";
    return { kind: "failed", code };
  } catch {
    return { kind: "uncertain", code: "NETWORK_OUTCOME_UNKNOWN" };
  }
};
