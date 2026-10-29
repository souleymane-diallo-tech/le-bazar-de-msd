import "server-only";
import { headers } from "next/headers";
import { getAuth } from "./auth";
import { getDb } from "@/lib/db";
import { hasPermission, type Permission } from "./permissions";

export async function getActor() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  // Re-read current role/activity; don't trust a stale cookie or client-supplied role.
  const user = await getDb().user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, roleId: true, active: true },
  });
  return user?.active && ["OWNER", "MANAGER"].includes(user.roleId)
    ? user
    : null;
}

export async function requirePermission(permission: Permission) {
  const actor = await getActor();
  if (!actor || !hasPermission(actor, permission)) throw new Error("FORBIDDEN");
  return actor;
}
