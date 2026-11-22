import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { applyStatus } from "@/modules/notifications/service";
import { validSignature, statusEvents } from "@/modules/notifications/webhook";
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams,
    expected = process.env.WHATSAPP_VERIFY_TOKEN;
  const received = p.get("hub.verify_token") ?? "";
  if (
    !expected ||
    Buffer.byteLength(received) !== Buffer.byteLength(expected) ||
    p.get("hub.mode") !== "subscribe" ||
    !timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  )
    return new Response(null, { status: 403 });
  const challenge = p.get("hub.challenge");
  return challenge && /^\d{1,100}$/.test(challenge)
    ? new Response(challenge)
    : new Response(null, { status: 400 });
}
export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > 256000) return new Response(null, { status: 413 });
  if (
    !validSignature(
      body,
      request.headers.get("x-hub-signature-256"),
      process.env.WHATSAPP_APP_SECRET,
    )
  )
    return new Response(null, { status: 401 });
  const phone = process.env.WHATSAPP_PHONE_NUMBER_ID,
    account = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  if (!phone || !account) return new Response(null, { status: 503 });
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }
  try {
    for (const event of statusEvents(parsed, phone, account))
      await applyStatus(getDb(), event);
  } catch {
    return new Response(null, { status: 503 });
  }
  return new Response(null, { status: 200 });
}
