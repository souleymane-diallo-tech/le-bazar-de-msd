import { getAuth } from "@/modules/identity/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Expose only required login/session endpoints; no signup, account editing or reset without its verified workflow.
const allowed = new Set([
  "/api/auth/sign-in/email",
  "/api/auth/sign-out",
  "/api/auth/get-session",
]);

async function handle(request: Request) {
  if (!allowed.has(new URL(request.url).pathname.replace(/\/$/, ""))) {
    return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  try {
    return await getAuth().handler(request);
  } catch {
    return Response.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}

export const GET = handle;
export const POST = handle;
