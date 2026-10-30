import "dotenv/config";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { readPublicCatalog } from "@/modules/catalog/repository";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  !new URL(url).pathname.endsWith("_test") ||
  url === process.env.DATABASE_URL
)
  throw new Error("Base de test isolée requise.");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});
const prefix = `visibility-${randomUUID()}`;
let categoryId: string;
beforeAll(async () => {
  const category = await db.category.create({
    data: { name: prefix, slug: prefix },
  });
  categoryId = category.id;
  for (const [key, status, demo] of [
    ["draft", "DRAFT", false],
    ["archived", "ARCHIVED", false],
    ["live", "PUBLISHED", false],
    ["demo", "PUBLISHED", true],
  ] as const) {
    await db.product.create({
      data: {
        id: `${prefix}-${key}`,
        slug: `${prefix}-${key}`,
        name: key,
        categoryId,
        status,
        isDemo: demo,
        variants: {
          create: {
            sku: `${prefix}-${key}`,
            label: "Test",
            priceXof: 100,
            inventory: { create: { onHand: 5, reserved: 2 } },
          },
        },
      },
    });
  }
});
afterAll(async () => {
  if (!categoryId) {
    await db.$disconnect();
    return;
  }
  await db.inventory.deleteMany({
    where: { variant: { product: { categoryId } } },
  });
  await db.productVariant.deleteMany({ where: { product: { categoryId } } });
  await db.product.deleteMany({ where: { categoryId } });
  if (categoryId) await db.category.delete({ where: { id: categoryId } });
  await db.$disconnect();
});
it("exclut brouillons/archives et déduit les réservations", async () => {
  const products = (await readPublicCatalog(db, true)).filter((p) =>
    p.id.startsWith(prefix),
  );
  expect(products.map((p) => p.name).sort()).toEqual(["demo", "live"]);
  expect(products[0].variants[0].available).toBe(3);
});
it("exclut les produits de démonstration en production", async () => {
  expect(
    (await readPublicCatalog(db, false))
      .filter((p) => p.id.startsWith(prefix))
      .map((p) => p.name),
  ).toEqual(["live"]);
});
it("masque une catégorie désactivée et les variantes inactives", async () => {
  await db.productVariant.updateMany({
    where: { productId: `${prefix}-live` },
    data: { active: false },
  });
  expect(
    (await readPublicCatalog(db, false)).filter((p) => p.id.startsWith(prefix)),
  ).toHaveLength(0);
  await db.category.update({
    where: { id: categoryId },
    data: { active: false },
  });
  expect(
    (await readPublicCatalog(db, true)).filter((p) => p.id.startsWith(prefix)),
  ).toHaveLength(0);
});
