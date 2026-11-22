import { createHmac } from "node:crypto";
import { describe, it, expect, vi, afterEach } from "vitest";
import { validSignature, statusEvents } from "@/modules/notifications/webhook";
import { notificationMode, metaConfig } from "@/modules/notifications/config";
import { templatePayload, sendMeta } from "@/modules/notifications/provider";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const config = {
  WHATSAPP_ACCESS_TOKEN: "x".repeat(30),
  WHATSAPP_PHONE_NUMBER_ID: "12345",
  WHATSAPP_GRAPH_VERSION: "v23.0",
  WHATSAPP_TEMPLATE_NAME: "new_order",
  WHATSAPP_TEMPLATE_LANGUAGE: "fr",
  WHATSAPP_RECIPIENT_CONSENT: "confirmed" as const,
  APP_URL: "https://example.test",
};
const message = {
  attemptId: "2e2a9622-af50-4fad-9f78-d0e2b69615ae",
  recipient: "12025550123",
  orderId: "order-1",
  reference: "DEMO-1",
  totalXof: 1500,
  quantity: 2,
  zone: "Zone fictive",
  isDemo: true,
};
describe("WhatsApp boundary", () => {
  it("defaults to disabled and requires explicit configuration", () => {
    expect(notificationMode({})).toBe("disabled");
    expect(() => metaConfig({})).toThrow("CONFIGURATION_REQUIRED");
  });
  it("rejects altered and missing webhook signatures", () => {
    const body = '{"test":true}',
      signature =
        "sha256=" + createHmac("sha256", "secret").update(body).digest("hex");
    expect(validSignature(body, signature, "secret")).toBe(true);
    expect(validSignature(body + " ", signature, "secret")).toBe(false);
    expect(validSignature(body, null, "secret")).toBe(false);
  });
  it("filters unrelated accounts and phone numbers", () => {
    const body = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "account",
          changes: [
            {
              field: "messages",
              value: {
                metadata: { phone_number_id: "phone" },
                statuses: [
                  {
                    id: "wamid.1",
                    recipient_id: "12025550123",
                    status: "delivered",
                    timestamp: "1795000000",
                    biz_opaque_callback_data: message.attemptId,
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    expect(statusEvents(body, "phone", "account")).toHaveLength(1);
    expect(statusEvents(body, "other", "account")).toHaveLength(0);
    expect(statusEvents(body, "phone", "other")).toHaveLength(0);
  });
  it("sends a protected admin link and a test reference", () => {
    const p = templatePayload(message, config);
    expect(p.template.components[0].parameters[0].text).toBe("TEST · DEMO-1");
    expect(p.template.components[0].parameters[4].text).toBe(
      "https://example.test/admin/commandes/order-1",
    );
    expect(JSON.stringify(p)).not.toContain("accessToken");
  });
  it("does not retry an ambiguous network outcome", async () => {
    Object.entries(config).forEach(([k, v]) => vi.stubEnv(k, v));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("private details")),
    );
    expect(await sendMeta(message)).toEqual({
      kind: "uncertain",
      code: "NETWORK_OUTCOME_UNKNOWN",
    });
  });
  it("retries explicit rate limits only", async () => {
    Object.entries(config).forEach(([k, v]) => vi.stubEnv(k, v));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 429 })),
    );
    expect(await sendMeta(message)).toEqual({
      kind: "retry",
      code: "RATE_LIMIT",
    });
  });
});
