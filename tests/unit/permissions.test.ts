import { describe, expect, it } from "vitest";
import { hasPermission, permissions } from "@/modules/identity/permissions";

describe("permissions serveur", () => {
  it("refuse les visiteurs, comptes désactivés et rôles inconnus", () => {
    for (const permission of permissions) {
      expect(hasPermission(null, permission)).toBe(false);
      expect(
        hasPermission({ active: false, roleId: "OWNER" }, permission),
      ).toBe(false);
      expect(hasPermission({ active: true, roleId: "ADMIN" }, permission)).toBe(
        false,
      );
    }
  });
  it("permet au gestionnaire de collecter, sans rembourser ou modifier les rôles", () => {
    const actor = { active: true, roleId: "MANAGER" };
    expect(hasPermission(actor, "payments:collect")).toBe(true);
    expect(hasPermission(actor, "payments:refund")).toBe(false);
    expect(hasPermission(actor, "users:manage")).toBe(false);
    expect(hasPermission(actor, "settings:write")).toBe(false);
  });
  it("autorise le propriétaire actif", () => {
    for (const permission of permissions)
      expect(hasPermission({ active: true, roleId: "OWNER" }, permission)).toBe(
        true,
      );
  });
});
