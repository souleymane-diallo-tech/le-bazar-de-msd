import { createHash, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { dispatchNotifications } from "@/modules/notifications/queue";
// Independent scheduler recovery endpoint. Never invoked by a public browser.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (
    !secret ||
    !timingSafeEqual(
      createHash("sha256")
        .update(request.headers.get("authorization") ?? "")
        .digest(),
      createHash("sha256").update(`Bearer ${secret}`).digest(),
    )
  )
    return new Response(null, { status: 401 });
  try {
    await dispatchNotifications(getDb());
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
