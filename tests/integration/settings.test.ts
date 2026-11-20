import "dotenv/config";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { savePublicSettings } from "@/modules/settings/service";
import { emptySettings } from "@/modules/settings/rules";
const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  !new URL(url).pathname.endsWith("_test") ||
  url === process.env.DATABASE_URL
)
  throw new Error("Base de test isolée requise");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});
const prefix = `settings-${randomUUID()}`,
  owner = `${prefix}-owner`,
  manager = `${prefix}-manager`;
let initial: Awaited<ReturnType<typeof db.storeSettings.findUnique>>;
beforeAll(async () => {
  initial = await db.storeSettings.findUnique({ where: { id: "store" } });
  for (const [id, roleId] of [
    [owner, "OWNER"],
    [manager, "MANAGER"],
  ])
    await db.user.create({
      data: { id, roleId, name: "Test", email: `${id}@example.test` },
    });
});
afterAll(async () => {
  if (initial)
    await db.storeSettings.update({
      where: { id: "store" },
      data: {
        contacts: initial.contacts ?? {},
        socialLinks: initial.socialLinks ?? {},
        version: initial.version,
      },
    });
  else await db.storeSettings.deleteMany({ where: { id: "store" } });
  await db.auditLog.deleteMany({
    where: { actorId: { in: [owner, manager] } },
  });
  await db.user.deleteMany({ where: { id: { in: [owner, manager] } } });
  await db.$disconnect();
});
it("réserve les contacts au propriétaire actif", async () => {
  const version =
    (await db.storeSettings.findUnique({ where: { id: "store" } }))?.version ??
    0;
  await expect(
    savePublicSettings(db, manager, { ...emptySettings, version }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  await db.user.update({ where: { id: owner }, data: { active: false } });
  await expect(
    savePublicSettings(db, owner, { ...emptySettings, version }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  await db.user.update({ where: { id: owner }, data: { active: true } });
  await db.user.update({
    where: { id: owner },
    data: { accessExpiresAt: new Date(0) },
  });
  await expect(
    savePublicSettings(db, owner, { ...emptySettings, version }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  await db.user.update({
    where: { id: owner },
    data: { accessExpiresAt: null },
  });
});
it("sauvegarde versionnée, conflit concurrent et audit sans coordonnées", async () => {
  const version =
    (await db.storeSettings.findUnique({ where: { id: "store" } }))?.version ??
    0;
  const input = { ...emptySettings, whatsapp: "+1 (202) 555-0123", version };
  const results = await Promise.allSettled([
    savePublicSettings(db, owner, input),
    savePublicSettings(db, owner, {
      ...input,
      facebook: "https://www.facebook.com/msd_demo_test",
    }),
  ]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(
    await db.storeSettings.findUnique({ where: { id: "store" } }),
  ).toMatchObject({
    version: version + 1,
    contacts: { whatsapp: "12025550123" },
  });
  const logs = await db.auditLog.findMany({ where: { actorId: owner } });
  expect(logs).toHaveLength(1);
  expect(JSON.stringify(logs)).not.toContain("12025550123");
});
