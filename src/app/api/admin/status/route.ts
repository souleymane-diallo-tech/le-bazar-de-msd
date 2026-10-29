import { getActor } from "@/modules/identity/session";
import { hasPermission } from "@/modules/identity/permissions";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await getActor();
  if (!actor) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(actor, "audit:read"))
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  await getDb().$queryRaw`SELECT 1`;
  return Response.json(
    { database: "connected", phase: 2 },
    { headers: { "Cache-Control": "no-store" } },
  );
}
