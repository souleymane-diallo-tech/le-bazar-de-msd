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
let initialSettings: Awaited<ReturnType<typeof db.storeSettings.findUnique>>;
test.beforeAll(async () => {
  initialSettings = await db.storeSettings.findUnique({
    where: { id: "store" },
  });
  await db.storeSettings.upsert({
    where: { id: "store" },
    create: {
      id: "store",
      name: "Le Bazar de MSD",
      contacts: { whatsapp: "12025550123" },
    },
    update: { contacts: { whatsapp: "12025550123" } },
  });
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
  if (initialSettings)
    await db.storeSettings.update({
      where: { id: "store" },
      data: { contacts: initialSettings.contacts ?? {} },
    });
  else await db.storeSettings.deleteMany({ where: { id: "store" } });
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
  const created = await db.product.findUnique({ where: { slug: `${id}-ui` } });
  if (created) {
    await db.stockMovement.deleteMany({
      where: { variant: { productId: created.id } },
    });
    await db.inventory.deleteMany({
      where: { variant: { productId: created.id } },
    });
    await db.productVariant.deleteMany({ where: { productId: created.id } });
    await db.productImage.deleteMany({ where: { productId: created.id } });
    await db.product.delete({ where: { id: created.id } });
  }
  await db.auditLog.deleteMany({ where: { actorId: ownerId } });
  await db.user.delete({ where: { id: ownerId } });
  await db.productImage.deleteMany({ where: { productId: id } });
  await db.inventory.delete({ where: { variantId: id } });
  await db.productVariant.delete({ where: { id } });
  await db.product.delete({ where: { id } });
  await db.category.delete({ where: { id } });
  await db.$disconnect();
});
test("gérant crée un produit, règle prix et stock, publie puis archive ; session expirée refusée", async ({
  page,
  request,
}) => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/catalogue");
  await page
    .getByText("Créer un produit de démonstration", { exact: true })
    .click();
  const create = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Créer le brouillon" }) });
  await create.getByLabel("Nom du produit").fill("Produit gestion E2E");
  await create.getByLabel("Adresse courte").fill(`${id}-ui`);
  await create.getByLabel("Catégorie").selectOption(id);
  await create
    .getByLabel("Description accessible")
    .fill("Photo de démonstration");
  await create.getByLabel("Importer une photo du produit").setInputFiles({
    name: "fake.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("not an image"),
  });
  await create.getByRole("button", { name: "Créer le brouillon" }).click();
  await expect(create.getByRole("alert")).toContainText("Photo invalide");
  // Failed server actions reset uncontrolled form values; refill before retry.
  await create.getByLabel("Nom du produit").fill("Produit gestion E2E");
  await create.getByLabel("Adresse courte").fill(`${id}-ui`);
  await create.getByLabel("Catégorie").selectOption(id);
  await create
    .getByLabel("Description accessible")
    .fill("Photo de démonstration");
  await create
    .getByLabel("Importer une photo du produit")
    .setInputFiles("public/images/horloge.jpg");
  await create.getByRole("button", { name: "Créer le brouillon" }).click();
  await expect(create.getByRole("status")).toHaveText(
    "Modification enregistrée.",
  );
  const uploaded = await db.product.findUniqueOrThrow({
    where: { slug: `${id}-ui` },
    include: { images: true },
  });
  const imagePath = uploaded.images[0].objectKey;
  expect(imagePath).toMatch(/^\/media\/products\/[a-f0-9]{64}\.webp$/);
  expect((await request.get(imagePath)).status()).toBe(404);
  const entry = page
    .locator("details")
    .filter({
      has: page.locator("summary").filter({ hasText: /^Produit gestion E2E/ }),
    })
    .first();
  await entry.locator("summary").first().click();
  await entry.getByText("Ajouter une variante", { exact: true }).click();
  const variant = entry
    .locator("form")
    .filter({ has: page.getByLabel("Nouveau SKU unique") });
  await variant.getByLabel("Libellé").fill("Standard");
  await variant.getByLabel("Nouveau SKU unique").fill(`${id}-ui`);
  await variant.getByLabel("Prix fictif en FCFA").fill("3500");
  await variant
    .getByRole("button", { name: "Enregistrer", exact: true })
    .click();
  await expect(variant.getByRole("status")).toHaveText(
    "Modification enregistrée.",
  );
  await entry.getByLabel("Stock physique total").fill("7");
  await entry.getByLabel("Motif de l’ajustement").fill("Stock de recette");
  await entry.getByRole("button", { name: "Ajuster le stock" }).click();
  await expect(entry.getByText(/Réservé : 0 · Disponible : 7/)).toBeVisible();
  const edit = entry
    .locator("form")
    .filter({ has: page.getByLabel("Nom du produit") });
  await edit.getByLabel("Publication").selectOption("PUBLISHED");
  await edit.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(edit.getByRole("status")).toHaveText(
    "Modification enregistrée.",
  );
  await page.goto(`/produits/${id}-ui`);
  await expect(
    page.getByRole("heading", { name: "Produit gestion E2E" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Ajouter au panier/ }),
  ).toBeEnabled();
  const publicPhoto = await request.get(imagePath);
  expect(publicPhoto.status()).toBe(200);
  expect(publicPhoto.headers()["content-type"]).toBe("image/webp");
  await expect(
    page
      .getByRole("img", { name: "Photo de démonstration", exact: true })
      .first(),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByRole("img", { name: "Photo de démonstration", exact: true })
        .first()
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.goto(`/admin/catalogue?q=Produit%20gestion%20E2E`);
  await entry.locator("summary").first().click();
  await edit
    .getByLabel("Importer une photo du produit")
    .setInputFiles("public/images/ventilateur.jpg");
  await edit.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(edit.getByRole("status")).toHaveText(
    "Modification enregistrée.",
  );
  const replaced = await db.product.findUniqueOrThrow({
    where: { slug: `${id}-ui` },
    include: { images: true },
  });
  expect(replaced.images[0].objectKey).not.toBe(imagePath);
  await expect(edit.getByLabel("Photographie fournie")).toHaveValue(
    replaced.images[0].objectKey,
  );
  expect((await request.get(replaced.images[0].objectKey)).status()).toBe(200);
  expect((await request.get(imagePath)).status()).toBe(404);
  await edit.getByLabel("Publication").selectOption("ARCHIVED");
  await edit.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(edit.getByRole("status")).toHaveText(
    "Modification enregistrée.",
  );
  expect((await page.goto(`/produits/${id}-ui`))?.status()).toBe(404);
  expect((await request.get(imagePath)).status()).toBe(404);
  expect((await request.get(replaced.images[0].objectKey)).status()).toBe(404);
  await db.user.update({
    where: { id: ownerId },
    data: { accessExpiresAt: new Date(0) },
  });
  try {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/connexion$/);
    expect((await page.request.get("/api/admin/status")).status()).toBe(401);
  } finally {
    await db.user.update({
      where: { id: ownerId },
      data: { accessExpiresAt: null },
    });
  }
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
  await expect(
    page.getByRole("checkbox", { name: /Je comprends/ }),
  ).toBeFocused();
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
  const whatsapp = page.getByRole("link", {
    name: "Envoyer le récapitulatif sur WhatsApp",
  });
  await expect(whatsapp).toBeVisible();
  const prepared = new URL((await whatsapp.getAttribute("href"))!);
  expect(prepared.pathname).toBe("/12025550123");
  const message = prepared.searchParams.get("text")!;
  for (const value of [
    order.reference,
    "2500 FCFA",
    "Client fictif E2E",
    "Adresse de test seulement",
    "+221770000000",
    "Article test commande",
  ])
    expect(message).toContain(value);
  expect(message).not.toContain(order.accessTokenHash);
  // Inspect only: never send a message to an external recipient in tests.
  await page.reload();
  await page
    .getByRole("button", { name: /Retrouver ma dernière confirmation/ })
    .click();
  await expect(page.getByText(order.reference, { exact: false })).toBeVisible();
  await expect(whatsapp).toBeVisible();
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
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/admin/notifications");
    await expect(
      page.getByRole("heading", { name: "Notifications WhatsApp" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("button", { name: "Reprendre les notifications en attente" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText(
    "Modification enregistrée.",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("whatsapp-notifications-390.png"),
    fullPage: true,
  });
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
  await page.getByRole("checkbox", { name: /Je comprends/ }).check();
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

test("confirmation client facultative, consentement explicite au clavier et notification separee", async ({
  page,
}) => {
  await page.goto(`/produits/${id}`);
  await page.getByRole("button", { name: /Ajouter au panier/ }).click();
  await page.goto("/commande");
  await page
    .getByLabel("Nom fictif", { exact: true })
    .fill("Client WhatsApp fictif");
  await page.getByLabel("Téléphone fictif").fill("+221770000000");
  await page.getByLabel("Quartier fictif").fill("Quartier test");
  await page
    .getByLabel("Adresse fictive", { exact: true })
    .fill("Adresse fictive de test");
  const consent = page.getByRole("checkbox", { name: /J’accepte de recevoir/ });
  await expect(consent).not.toBeChecked();
  await page.getByLabel("Votre numéro WhatsApp de test").fill("+12025550123");
  await consent.focus();
  await page.keyboard.press("Space");
  await expect(consent).toBeChecked();
  await page.getByRole("checkbox", { name: /Je comprends/ }).check();
  await page.getByRole("button", { name: "Vérifier le total" }).click();
  await page
    .getByRole("button", { name: "Confirmer la commande de test" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Votre commande de test est reçue." }),
  ).toBeVisible();
  await expect(page.getByText(/Confirmation WhatsApp client/)).toBeVisible();
  const order = await db.order.findFirstOrThrow({
    where: {
      items: { some: { variantId: id } },
      customer: { name: "Client WhatsApp fictif" },
    },
    include: { notifications: true },
  });
  expect(
    order.notifications.filter((n) => n.kind === "CUSTOMER_ORDER_RECEIVED"),
  ).toHaveLength(1);
  expect(order.contactSnapshot).toMatchObject({
    whatsappConsent: {
      recipient: "12025550123",
      version: "order-confirmation-v1",
    },
  });
});
