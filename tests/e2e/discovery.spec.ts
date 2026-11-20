import "dotenv/config";
import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
const url = process.env.DATABASE_URL;
if (
  !url ||
  !new URL(url).pathname.endsWith("_dev") ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname) ||
  !["development", "test"].includes(process.env.APP_ENV ?? "")
)
  throw new Error("Base locale E2E requise");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});
const id = `e2e-settings-${randomUUID()}`,
  email = `${id}@example.test`,
  password = `E2e-${randomUUID()}!`;
let initial: Awaited<ReturnType<typeof db.storeSettings.findUnique>>;
test.beforeAll(async () => {
  initial = await db.storeSettings.findUnique({ where: { id: "store" } });
  await db.rateLimit.deleteMany({
    where: { key: { endsWith: "|/sign-in/email" } },
  });
  await db.user.create({
    data: {
      id,
      name: "Équipe contacts",
      email,
      roleId: "OWNER",
      accounts: {
        create: {
          providerId: "credential",
          accountId: id,
          password: await hashPassword(password),
        },
      },
    },
  });
  await db.storeSettings.upsert({
    where: { id: "store" },
    create: { name: "Le Bazar de MSD", contacts: {}, socialLinks: {} },
    update: { contacts: {}, socialLinks: {} },
  });
});
test.afterAll(async () => {
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
  await db.auditLog.deleteMany({ where: { actorId: id } });
  await db.user.deleteMany({ where: { id } });
  await db.$disconnect();
});
test("propriétaire configure WhatsApp, lien contextualisé sans envoi automatique", async ({
  page,
}) => {
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: "Ouvrir WhatsApp" })).toHaveCount(
    0,
  );
  await page.goto("/admin/parametres");
  await expect(page).toHaveURL(/\/connexion$/);
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  const signedIn = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/auth/sign-in/email") &&
      r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  expect((await signedIn).status()).toBe(200);
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "Contacts & visibilité" }).click();
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByLabel("WhatsApp Business (format international)")
    .fill("+1 (202) 555-0123");
  await page
    .getByLabel("Profil Instagram — URL HTTPS")
    .fill("https://www.instagram.com/msd_demo_test/");
  await page
    .getByRole("button", { name: "Enregistrer les contacts publics" })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Modification enregistrée.",
  );
  await page.goto("/produits/distributeur?utm_source=secret-test#fragment");
  const href = await page
    .getByRole("link", { name: "Contacter sur WhatsApp" })
    .getAttribute("href");
  const whatsapp = new URL(href!);
  expect(whatsapp.origin + whatsapp.pathname).toBe("https://wa.me/12025550123");
  expect(whatsapp.searchParams.get("text")).toContain("démonstration");
  expect(whatsapp.searchParams.get("text")).toContain(
    "http://localhost:3000/produits/distributeur",
  );
  expect(href).not.toContain("secret-test");
  expect(href).not.toContain("fragment");
  // Inspect the link only: never open WhatsApp or send a test message.
  await page.goto("/contact");
  await expect(
    page.getByRole("link", { name: "Ouvrir WhatsApp" }),
  ).toHaveAttribute("href", /^https:\/\/wa.me\/12025550123\?/);
});
test("démo non indexable, canonical propre, aucun produit fictif dans le sitemap", async ({
  page,
  request,
}) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (
      /^https?:/.test(r.url()) &&
      new URL(r.url()).origin !== "http://localhost:3000"
    )
      external.push(new URL(r.url()).hostname);
  });
  const response = await page.goto("/produits/horloge?utm_source=demo");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/produits/horloge",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "http://localhost:3000/produits/horloge",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    0,
  );
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).not.toContain("<loc>");
  await page.goto("/catalogue?q=horloge");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/catalogue",
  );
  await page.goto("/demonstration");
  await expect(
    page.getByRole("heading", { name: "Aucun suivi publicitaire" }),
  ).toBeVisible();
  expect(external).toEqual([]);
});
test("contact et informations démo lisibles aux cinq largeurs", async ({
  page,
}, testInfo) => {
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/contact", "/demonstration"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    if (width === 390 || width === 1440) {
      await page.goto("/contact");
      await page.screenshot({
        path: testInfo.outputPath(`contact-${width}.png`),
        fullPage: true,
      });
    }
  }
});
