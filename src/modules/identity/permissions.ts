export const permissions = [
  "catalog:write",
  "inventory:write",
  "orders:manage",
  "payments:collect",
  "payments:refund",
  "settings:write",
  "users:manage",
  "audit:read",
] as const;
export type Permission = (typeof permissions)[number];

const managerPermissions: ReadonlySet<Permission> = new Set([
  "catalog:write",
  "inventory:write",
  "orders:manage",
  "payments:collect",
]);

export function hasPermission(
  actor: { active: boolean; roleId: string } | null,
  permission: Permission,
): boolean {
  if (!actor?.active) return false;
  if (actor.roleId === "OWNER") return true;
  return actor.roleId === "MANAGER" && managerPermissions.has(permission);
}
