import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
export function validSignature(
  body: string,
  signature: string | null,
  secret: string | undefined,
) {
  if (!secret || !signature || !/^sha256=[a-f0-9]{64}$/.test(signature))
    return false;
  const expected = createHmac("sha256", secret).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature.slice(7), "hex"));
}
const status = z.object({
  id: z.string().min(1).max(300),
  recipient_id: z.string().regex(/^\d{8,15}$/),
  status: z.enum(["sent", "delivered", "read", "failed"]),
  timestamp: z.string().regex(/^\d{1,12}$/),
  biz_opaque_callback_data: z.string().uuid().optional(),
});
const envelope = z.object({
  object: z.literal("whatsapp_business_account"),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          field: z.string(),
          value: z.object({
            metadata: z.object({ phone_number_id: z.string() }).optional(),
            statuses: z.array(z.unknown()).optional(),
          }),
        }),
      ),
    }),
  ),
});
export function statusEvents(
  body: unknown,
  phoneNumberId: string,
  accountId: string,
) {
  const parsed = envelope.safeParse(body);
  if (!parsed.success) return [];
  return parsed.data.entry
    .filter((e) => e.id === accountId)
    .flatMap((e) => e.changes)
    .filter(
      (c) =>
        c.field === "messages" &&
        c.value.metadata?.phone_number_id === phoneNumberId,
    )
    .flatMap((c) => c.value.statuses ?? [])
    .flatMap((value) => {
      const s = status.safeParse(value);
      if (!s.success) return [];
      return [
        {
          messageId: s.data.id,
          recipient: s.data.recipient_id,
          status: s.data.status,
          attemptId: s.data.biz_opaque_callback_data,
          timestamp: new Date(Number(s.data.timestamp) * 1000),
        },
      ];
    });
}
