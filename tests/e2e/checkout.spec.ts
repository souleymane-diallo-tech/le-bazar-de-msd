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
const suffix = randomUUID(),
  id = `e2e-checkout-${suffix}`,
  ownerId = `e2e-orders-owner-${suffix}`;
const email = `${ownerId}@example.test`,
  password = `E2e-${randomUUID()}!`;
test.beforeAll(async () => {
  await db.rateLimit.deleteMany({
    where: { key: { endsWith: "|/sign-in/email" } },
  });
  await db.rateLimit.deleteMany({
    where: { key: { startsWith: "checkout:" } },
  });
  await db.category.create({
    data: { id, name: "Catégorie test commande", slug: id },
  });
  await db.product.create({
    data: {
      id,
      categoryId: id,
      slug: id,
      name: "Article test commande",
      isDemo: true,
      status: "PUBLISHED",
      variants: {
        create: {
          id,
          sku: id,
          label: "Test",
          priceXof: 1000,
          inventory: { create: { onHand: 10 } },
        },
      },
      images: {
        create: { objectKey: "/images/horloge.jpg", alt: "Photo test" },
      },
    },
  });
  await db.user.create({
    data: {
      id: ownerId,
      name: "Équipe commandes",
      email,
      roleId: "OWNER",
      accounts: {
        create: {
          providerId: "credential",
          accountId: ownerId,
          password: await hashPassword(password),
        },
      },
    },
  });
});
test.afterAll(async () => {
  const orders = await db.order.findMany({
    where: { items: { some: { variantId: id } } },
  });
  const ids = orders.map((o) => o.id);
  await db.refund.deleteMany({ where: { payment: { orderId: { in: ids } } } });
  await db.payment.deleteMany({ where: { orderId: { in: ids } } });
  await db.shipment.deleteMany({ where: { orderId: { in: ids } } });
  await db.orderStatusHistory.deleteMany({ where: { orderId: { in: ids } } });
  await db.stockMovement.deleteMany({ where: { variantId: id } });
  await db.stockReservation.deleteMany({
    where: { orderItem: { orderId: { in: ids } } },
  });
  await db.orderItem.deleteMany({ where: { orderId: { in: ids } } });
  await db.order.deleteMany({ where: { id: { in: ids } } });
  await db.customer.deleteMany({
    where: { id: { in: orders.map((o) => o.customerId) } },
  });
  await db.auditLog.deleteMany({ where: { actorId: ownerId } });
  await db.user.delete({ where: { id: ownerId } });
  await db.productImage.deleteMany({ where: { productId: id } });
  await db.inventory.delete({ where: { variantId: id } });
  await db.productVariant.delete({ where: { id } });
  await db.product.delete({ where: { id } });
  await db.category.delete({ where: { id } });
  await db.$disconnect();
});
test("checkout clavier mobile, confirmation privée, traitement et collecte séparée", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/produits/${id}`);
  await page.getByRole("button", { name: /Ajouter au panier/ }).click();
  await page.goto("/commande");
  await page
    .getByLabel("Nom fictif", { exact: true })
    .fill("Client fictif E2E");
  await page.getByLabel("Téléphone fictif").fill("+221770000000");
  await page.getByLabel("Zone de livraison").selectOption("demo-dakar");
  await page.getByLabel("Quartier fictif").fill("Quartier test");
  await page
    .getByLabel("Adresse fictive", { exact: true })
    .fill("Adresse de test seulement");
  await page
    .getByLabel("Repère ou instructions")
    .fill("Test sans livraison réelle");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("checkbox")).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Confirmer la commande de test" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("checkout-390.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Confirmer la commande de test" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Votre commande de test est reçue." }),
  ).toBeVisible();
  await expect(page.getByText("À confirmer · Non encaissée")).toBeVisible();
  const order = await db.order.findFirstOrThrow({
    where: { items: { some: { variantId: id } } },
    orderBy: { createdAt: "desc" },
  });
  expect(order.totalXof).toBe(2500);
  await page.reload();
  await page
    .getByRole("button", { name: /Retrouver ma dernière confirmation/ })
    .click();
  await expect(page.getByText(order.reference, { exact: false })).toBeVisible();
  const noToken = await page.request.post("/api/checkout", {
    headers: { Origin: "http://localhost:3000" },
    data: {
      action: "read",
      data: { reference: order.reference, accessToken: "0".repeat(64) },
    },
  });
  expect(noToken.status()).toBe(404);
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bienvenue, Équipe commandes" }),
  ).toBeVisible();
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/admin/catalogue");
    await expect(
      page.getByRole("heading", { name: "Catalogue & stock" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/admin/commandes/${order.id}`);
  for (const [status, label] of [
    ["CONFIRMED", "Confirmée"],
    ["PREPARING", "En préparation"],
    ["SHIPPED", "Expédiée"],
    ["DELIVERED", "Livrée"],
  ]) {
    await page.getByLabel("Nouvel état").selectOption(status);
    await page.getByLabel("Motif / preuve").fill("Preuve de test fictive");
    await page.getByRole("button", { name: "Appliquer la transition" }).click();
    await expect(
      page.getByRole("heading", { name: label, exact: true }),
    ).toBeVisible();
  }
  expect(
    await db.payment.findFirst({ where: { orderId: order.id } }),
  ).toMatchObject({ status: "PENDING" });
  await page
    .getByLabel("Référence de collecte fictive")
    .fill(`collecte-${suffix}`);
  await page
    .getByRole("button", { name: "Enregistrer la collecte fictive" })
    .click();
  await expect(page.getByText(/État : Encaissé/)).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("admin-order-390.png"),
    fullPage: true,
  });
});
test("réponse perdue puis rechargement : récupération sans double commande", async ({
  page,
}) => {
  await page.goto(`/produits/${id}`);
  await page.getByRole("button", { name: /Ajouter au panier/ }).click();
  await page.goto("/commande");
  await page
    .getByLabel("Nom fictif", { exact: true })
    .fill("Client reprise fictif");
  await page.getByLabel("Téléphone fictif").fill("+221770000000");
  await page.getByLabel("Zone de livraison").selectOption("demo-dakar");
  await page.getByLabel("Quartier fictif").fill("Quartier test");
  await page
    .getByLabel("Adresse fictive", { exact: true })
    .fill("Adresse fictive de reprise");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Vérifier le total" }).click();
  await expect(
    page.getByRole("button", { name: "Confirmer la commande de test" }),
  ).toBeVisible();
  let dropped = false;
  await page.route("**/api/checkout", async (route) => {
    if (!dropped && route.request().postDataJSON().action === "place") {
      dropped = true;
      await route.fetch();
      await route.abort("failed");
    } else await route.continue();
  });
  const before = await db.order.count({
    where: { items: { some: { variantId: id } } },
  });
  await page
    .getByRole("button", { name: "Confirmer la commande de test" })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: /Retrouver ma dernière confirmation/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Votre commande de test est reçue." }),
  ).toBeVisible();
  expect(
    await db.order.count({ where: { items: { some: { variantId: id } } } }),
  ).toBe(before + 1);
});

test("checkout lisible aux cinq largeurs et origine étrangère refusée", async ({
  page,
  request,
}, testInfo) => {
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/commande");
    await expect(page.getByLabel("Nom fictif", { exact: true })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 1440)
      await page.screenshot({
        path: testInfo.outputPath("checkout-1440.png"),
        fullPage: true,
      });
  }
  expect(
    (
      await request.post("/api/checkout", {
        headers: { Origin: "https://untrusted.example" },
        data: { action: "place", data: {} },
      })
    ).status(),
  ).toBe(403);
});
