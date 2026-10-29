import "dotenv/config";
import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

// Creates only ephemeral accounts in the dedicated local/CI development DB.
const url = process.env.DATABASE_URL;
if (
  !url ||
  !new URL(url).pathname.endsWith("_dev") ||
  !["development", "test"].includes(process.env.APP_ENV ?? "")
) {
  throw new Error(
    "Tests E2E auth réservés à une base de développement dédiée.",
  );
}
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});
const suffix = randomUUID();
const ownerId = `e2e-owner-${suffix}`;
const managerId = `e2e-manager-${suffix}`;
const password = `E2e-${randomUUID()}!`;
const ownerEmail = `${ownerId}@example.test`;
const managerEmail = `${managerId}@example.test`;

test.beforeAll(async () => {
  const hashed = await hashPassword(password);
  for (const [id, email, roleId] of [
    [ownerId, ownerEmail, "OWNER"],
    [managerId, managerEmail, "MANAGER"],
  ]) {
    await db.role.upsert({
      where: { id: roleId },
      update: {},
      create: { id: roleId },
    });
    await db.user.create({
      data: {
        id,
        name: "Équipe test",
        email,
        roleId,
        accounts: {
          create: { providerId: "credential", accountId: id, password: hashed },
        },
      },
    });
  }
});
test.afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: [ownerId, managerId] } } });
  await db.$disconnect();
});

test("connexion propriétaire, déconnexion et refus d'une session révoquée", async ({
  page,
  request,
}) => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(ownerEmail);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bienvenue, Équipe test" }),
  ).toBeVisible();
  expect((await page.request.get("/api/admin/status")).status()).toBe(200);
  const previousCookie = (await page.context().cookies())
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL(/\/connexion$/);
  expect((await page.request.get("/api/admin/status")).status()).toBe(401);
  expect(
    (
      await request.get("/api/admin/status", {
        headers: { Cookie: previousCookie },
      })
    ).status(),
  ).toBe(401);
});

test("gestionnaire sans droit audit et révocation immédiate après désactivation", async ({
  page,
}) => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(managerEmail);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bienvenue, Équipe test" }),
  ).toBeVisible();
  expect((await page.request.get("/api/admin/status")).status()).toBe(403);
  await db.user.update({ where: { id: managerId }, data: { active: false } });
  expect((await page.request.get("/api/admin/status")).status()).toBe(401);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/connexion$/);
});

test("origine étrangère rejetée sur connexion", async ({ request }) => {
  const response = await request.post("/api/auth/sign-in/email", {
    headers: { Origin: "https://untrusted.example" },
    data: { email: ownerEmail, password },
  });
  expect(response.status()).toBe(403);
});
