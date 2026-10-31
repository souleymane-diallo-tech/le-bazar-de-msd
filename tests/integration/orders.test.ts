import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import {
  collectCash,
  createQuote,
  expireOrders,
  placeOrder,
  readConfirmation,
  transitionOrder,
} from "@/modules/orders/service";
import {
  adjustStock,
  refundCash,
  saveZone,
  saveProduct,
  saveVariant,
} from "@/modules/admin/service";
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
const prefix = `orders-${randomUUID()}`;
const policy = { enabled: true, secret: randomBytes(32).toString("hex") };
const owner = `${prefix}-owner`,
  manager = `${prefix}-manager`,
  zoneId = `${prefix}-zone`,
  categoryId = `${prefix}-cat`;
beforeAll(async () => {
  await db.category.create({
    data: { id: categoryId, name: prefix, slug: prefix },
  });
  await db.deliveryZone.create({
    data: { id: zoneId, name: prefix, feeXof: 500, isDemo: true },
  });
  for (const [id, roleId] of [
    [owner, "OWNER"],
    [manager, "MANAGER"],
  ])
    await db.user.create({
      data: { id, roleId, name: "Test", email: `${id}@example.test` },
    });
});
async function fixture(stock = 3) {
  const id = `${prefix}-${randomUUID()}`;
  await db.product.create({
    data: {
      id,
      name: "Produit test",
      slug: id,
      categoryId,
      isDemo: true,
      status: "PUBLISHED",
      variants: {
        create: {
          id,
          sku: id,
          label: "Test",
          priceXof: 1000,
          inventory: { create: { onHand: stock } },
        },
      },
    },
  });
  const basket = { zoneId, items: [{ variantId: id, quantity: 1 }] };
  const quote = await createQuote(db, basket, policy);
  const input = {
    ...basket,
    name: "Client fictif",
    phone: "+221770000000",
    district: "Quartier test",
    address: "Adresse fictive",
    instructions: "",
    demoAcknowledged: true,
    idempotencyKey: randomUUID(),
    accessToken: randomBytes(32).toString("hex"),
    quoteToken: quote.quoteToken,
  };
  return { id, basket, input };
}
async function orderFor(input: Awaited<ReturnType<typeof fixture>>["input"]) {
  const result = await placeOrder(db, input, policy);
  return db.order.findUniqueOrThrow({ where: { reference: result.reference } });
}
afterAll(async () => {
  const orders = await db.order.findMany({
    where: { items: { some: { variantId: { startsWith: prefix } } } },
    select: { id: true, customerId: true },
  });
  const ids = orders.map((o) => o.id);
  await db.refund.deleteMany({ where: { payment: { orderId: { in: ids } } } });
  await db.payment.deleteMany({ where: { orderId: { in: ids } } });
  await db.shipment.deleteMany({ where: { orderId: { in: ids } } });
  await db.orderStatusHistory.deleteMany({ where: { orderId: { in: ids } } });
  await db.stockMovement.deleteMany({
    where: { variantId: { startsWith: prefix } },
  });
  await db.stockReservation.deleteMany({
    where: { orderItem: { orderId: { in: ids } } },
  });
  await db.orderItem.deleteMany({ where: { orderId: { in: ids } } });
  await db.order.deleteMany({ where: { id: { in: ids } } });
  await db.customer.deleteMany({
    where: { id: { in: orders.map((o) => o.customerId) } },
  });
  await db.inventory.deleteMany({
    where: { variantId: { startsWith: prefix } },
  });
  await db.productVariant.deleteMany({ where: { id: { startsWith: prefix } } });
  await db.productImage.deleteMany({ where: { product: { categoryId } } });
  await db.product.deleteMany({ where: { categoryId } });
  await db.category.deleteMany({ where: { id: categoryId } });
  await db.deliveryZone.deleteMany({ where: { id: zoneId } });
  await db.auditLog.deleteMany({
    where: { actorId: { in: [owner, manager] } },
  });
  await db.user.deleteMany({ where: { id: { in: [owner, manager] } } });
  await db.$disconnect();
});
it("catalogue : création, publication, archivage et conflit d’édition", async () => {
  const input = {
    name: "Produit nouveau",
    slug: `${prefix}-new`,
    description: "Description",
    categoryId,
    status: "DRAFT",
    image: "/images/horloge.jpg",
    alt: "Horloge fictive",
  };
  const id = await saveProduct(db, manager, input);
  const initial = await db.product.findUniqueOrThrow({ where: { id } });
  expect(initial).toMatchObject({ isDemo: true, status: "DRAFT" });
  await saveProduct(db, manager, {
    ...input,
    id,
    updatedAt: initial.updatedAt.toISOString(),
    status: "PUBLISHED",
  });
  await expect(
    saveProduct(db, manager, {
      ...input,
      id,
      updatedAt: initial.updatedAt.toISOString(),
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  const published = await db.product.findUniqueOrThrow({ where: { id } });
  await saveProduct(db, manager, {
    ...input,
    id,
    updatedAt: published.updatedAt.toISOString(),
    status: "ARCHIVED",
  });
  expect(
    (await db.product.findUniqueOrThrow({ where: { id } })).archivedAt,
  ).not.toBeNull();
  await expect(
    saveProduct(db, manager, {
      ...input,
      image: "https://untrusted.example/photo.jpg",
    }),
  ).rejects.toThrow();
});
it("variante modifiée après devis : nouvelle confirmation obligatoire", async () => {
  const { id, input } = await fixture();
  const variant = await db.productVariant.findUniqueOrThrow({ where: { id } });
  await saveVariant(db, manager, {
    id,
    updatedAt: variant.updatedAt.toISOString(),
    productId: id,
    sku: id,
    label: "Variante modifiée",
    priceXof: 1200,
    active: true,
  });
  await expect(placeOrder(db, input, policy)).rejects.toMatchObject({
    code: "QUOTE_CHANGED",
  });
});
it("T03 dernière unité : une seule commande concurrente réussit", async () => {
  const { id, input } = await fixture(1);
  const results = await Promise.allSettled([
    placeOrder(db, input, policy),
    placeOrder(
      db,
      {
        ...input,
        idempotencyKey: randomUUID(),
        accessToken: randomBytes(32).toString("hex"),
      },
      policy,
    ),
  ]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(
    await db.inventory.findUnique({ where: { variantId: id } }),
  ).toMatchObject({ onHand: 1, reserved: 1 });
});
it("T04/T05 : double soumission concurrente idempotente et conflit de contenu", async () => {
  const { id, input } = await fixture();
  const [a, b] = await Promise.all([
    placeOrder(db, input, policy),
    placeOrder(db, input, policy),
  ]);
  expect(a).toEqual(b);
  expect(
    await db.inventory.findUnique({ where: { variantId: id } }),
  ).toMatchObject({ reserved: 1 });
  await expect(
    placeOrder(db, { ...input, name: "Autre client" }, policy),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  await expect(
    placeOrder(db, { ...input, accessToken: "0".repeat(64) }, policy),
  ).rejects.toMatchObject({ code: "CONFLICT" });
});
it("T02 : prix falsifié ou modifié après devis exige reconfirmation", async () => {
  const { id, input } = await fixture();
  await expect(
    placeOrder(
      db,
      { ...input, quoteToken: input.quoteToken.slice(0, -4) + "0000" },
      policy,
    ),
  ).rejects.toMatchObject({ code: "QUOTE_CHANGED" });
  await db.productVariant.update({ where: { id }, data: { priceXof: 2000 } });
  await expect(placeOrder(db, input, policy)).rejects.toMatchObject({
    code: "QUOTE_CHANGED",
  });
  expect(
    await db.order.count({ where: { idempotencyKey: input.idempotencyKey } }),
  ).toBe(0);
});
it("T06 : ligne devenue indisponible annule tout sans client orphelin", async () => {
  const a = await fixture(),
    b = await fixture();
  const basket = { zoneId, items: [...a.basket.items, ...b.basket.items] };
  const quote = await createQuote(db, basket, policy);
  await db.inventory.update({
    where: { variantId: b.id },
    data: { onHand: 0 },
  });
  await expect(
    placeOrder(
      db,
      { ...a.input, ...basket, quoteToken: quote.quoteToken },
      policy,
    ),
  ).rejects.toMatchObject({ code: "STOCK" });
  expect(
    await db.inventory.findUnique({ where: { variantId: a.id } }),
  ).toMatchObject({ reserved: 0 });
  expect(
    await db.order.count({ where: { idempotencyKey: a.input.idempotencyKey } }),
  ).toBe(0);
});
it("T07 : annulation concurrente libère une fois", async () => {
  const { id, input } = await fixture();
  const order = await orderFor(input);
  await Promise.all([
    transitionOrder(db, manager, order.id, "CANCELLED", "Test annulation"),
    transitionOrder(db, manager, order.id, "CANCELLED", "Test annulation"),
  ]);
  expect(
    await db.inventory.findUnique({ where: { variantId: id } }),
  ).toMatchObject({ onHand: 3, reserved: 0 });
  expect(
    await db.orderStatusHistory.count({
      where: { orderId: order.id, toStatus: "CANCELLED" },
    }),
  ).toBe(1);
});
it("expiration contre confirmation : aucune confirmation échue, stock libéré", async () => {
  const { id, input } = await fixture();
  const order = await orderFor(input);
  await db.stockReservation.updateMany({
    where: { orderItem: { orderId: order.id } },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  await Promise.allSettled([
    expireOrders(db, manager),
    transitionOrder(db, manager, order.id, "CONFIRMED", "Confirmation tardive"),
  ]);
  expect(await db.order.findUnique({ where: { id: order.id } })).toMatchObject({
    status: "CANCELLED",
  });
  expect(
    await db.inventory.findUnique({ where: { variantId: id } }),
  ).toMatchObject({ reserved: 0 });
});
it("T11/T13 : livraison distincte de collecte, remboursements concurrents plafonnés", async () => {
  const { id, input } = await fixture();
  const order = await orderFor(input);
  for (const next of [
    "CONFIRMED",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
  ] as const)
    await transitionOrder(db, manager, order.id, next, "Traitement test");
  expect(
    await db.payment.findFirst({ where: { orderId: order.id } }),
  ).toMatchObject({ status: "PENDING" });
  expect(
    await db.inventory.findUnique({ where: { variantId: id } }),
  ).toMatchObject({ onHand: 2, reserved: 0 });
  await collectCash(db, manager, order.id, `${prefix}-cash`);
  await collectCash(db, manager, order.id, `${prefix}-cash`);
  await expect(
    refundCash(db, manager, {
      orderId: order.id,
      amountXof: 1,
      reason: "Test",
      operationKey: randomUUID(),
    }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  const results = await Promise.allSettled(
    [1, 2].map(() =>
      refundCash(db, owner, {
        orderId: order.id,
        amountXof: 1000,
        reason: "Test remboursement",
        operationKey: randomUUID(),
      }),
    ),
  );
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
});
it("T12 : expédition, échec, réessai, retour sans double consommation ni réapprovisionnement", async () => {
  const { id, input } = await fixture();
  const order = await orderFor(input);
  for (const next of [
    "CONFIRMED",
    "PREPARING",
    "SHIPPED",
    "DELIVERY_FAILED",
    "SHIPPED",
    "DELIVERY_FAILED",
    "RETURNED",
    "RETURNED",
  ] as const)
    await transitionOrder(db, manager, order.id, next, "Preuve fictive");
  expect(
    await db.inventory.findUnique({ where: { variantId: id } }),
  ).toMatchObject({ onHand: 3, reserved: 0 });
  expect(await db.stockMovement.count({ where: { variantId: id } })).toBe(2);
});
it("T15 : référence publique sans jeton ne révèle aucune commande", async () => {
  const { input } = await fixture();
  const order = await orderFor(input);
  await expect(
    readConfirmation(db, order.reference, "wrong"),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  const receipt = await readConfirmation(
    db,
    order.reference,
    input.accessToken,
  );
  expect(receipt.totalXof).toBe(1500);
  expect(receipt).not.toHaveProperty("contactSnapshot");
  expect(receipt).not.toHaveProperty("addressSnapshot");
});
it("T16 : frais snapshot immuables, nouveau devis invalidé par changement de tarif", async () => {
  const a = await fixture();
  const order = await orderFor(a.input);
  const b = await fixture();
  await saveZone(db, owner, {
    id: zoneId,
    name: prefix,
    feeXof: 800,
    active: true,
  });
  expect(await db.order.findUnique({ where: { id: order.id } })).toMatchObject({
    deliveryXof: 500,
  });
  await expect(placeOrder(db, b.input, policy)).rejects.toMatchObject({
    code: "QUOTE_CHANGED",
  });
  await saveZone(db, owner, {
    id: zoneId,
    name: prefix,
    feeXof: 500,
    active: true,
  });
});
it("stock inférieur aux réservations et version périmée refusés", async () => {
  const { id, input } = await fixture();
  await orderFor(input);
  const inventory = await db.inventory.findUniqueOrThrow({
    where: { variantId: id },
  });
  await expect(
    adjustStock(db, manager, {
      variantId: id,
      onHand: 0,
      version: inventory.version,
      reason: "Test",
    }),
  ).rejects.toMatchObject({ code: "STOCK" });
  await expect(
    adjustStock(db, manager, {
      variantId: id,
      onHand: 5,
      version: 0,
      reason: "Test",
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
});
it("rôle et activité relus en transaction, démo désactivée refusée", async () => {
  const { input } = await fixture();
  await expect(
    placeOrder(db, input, { ...policy, enabled: false }),
  ).rejects.toMatchObject({ code: "DISABLED" });
  await expect(
    saveZone(db, manager, { name: "Interdit", feeXof: 0, active: true }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  await db.user.update({ where: { id: manager }, data: { active: false } });
  await expect(expireOrders(db, manager)).rejects.toMatchObject({
    code: "FORBIDDEN",
  });
  await db.user.update({ where: { id: manager }, data: { active: true } });
});
