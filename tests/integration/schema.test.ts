import "dotenv/config";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("_test"))
  throw new Error(
    "TEST_DATABASE_URL doit désigner une base dédiée suffixée _test.",
  );
if (url === process.env.DATABASE_URL)
  throw new Error(
    "La base de test doit être distincte de la base applicative.",
  );
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});
const key = randomUUID();
let categoryId: string;
let productId: string;
let variantId: string;

beforeAll(async () => {
  const category = await db.category.create({
    data: { name: "Test", slug: `test-${key}` },
  });
  categoryId = category.id;
  const product = await db.product.create({
    data: {
      name: "Test",
      slug: `test-${key}`,
      categoryId,
      variants: {
        create: {
          sku: `TEST-${key}`,
          label: "Test",
          priceXof: 1000,
          inventory: { create: { onHand: 1 } },
        },
      },
    },
    include: { variants: true },
  });
  productId = product.id;
  variantId = product.variants[0].id;
});
afterAll(async () => {
  if (variantId) {
    await db.inventory.deleteMany({ where: { variantId } });
    await db.productVariant.deleteMany({ where: { id: variantId } });
  }
  if (productId) await db.product.deleteMany({ where: { id: productId } });
  if (categoryId) await db.category.deleteMany({ where: { id: categoryId } });
  await db.$disconnect();
});

describe("contraintes PostgreSQL", () => {
  it("refuse prix négatif et SKU doublonné", async () => {
    await expect(
      db.productVariant.update({
        where: { id: variantId },
        data: { priceXof: -1 },
      }),
    ).rejects.toThrow();
    await expect(
      db.productVariant.create({
        data: { productId, sku: `TEST-${key}`, label: "Doublon", priceXof: 1 },
      }),
    ).rejects.toThrow();
  });
  it("refuse stock réservé supérieur au stock physique", async () => {
    await expect(
      db.inventory.update({ where: { variantId }, data: { reserved: 2 } }),
    ).rejects.toThrow();
  });
  it("n'autorise qu'une réservation conditionnelle concurrente de la dernière unité", async () => {
    const results = await Promise.all(
      [1, 2].map(
        () =>
          db.$executeRaw`UPDATE "Inventory" SET "reserved" = "reserved" + 1 WHERE "variantId" = ${variantId} AND "onHand" - "reserved" >= 1`,
      ),
    );
    expect(results.sort()).toEqual([0, 1]);
    expect(
      (await db.inventory.findUniqueOrThrow({ where: { variantId } })).reserved,
    ).toBe(1);
    await db.inventory.update({ where: { variantId }, data: { reserved: 0 } });
  });
  it("annule entièrement une transaction dont le second changement échoue", async () => {
    await expect(
      db.$transaction(async (tx) => {
        await tx.inventory.update({
          where: { variantId },
          data: { onHand: 7 },
        });
        await tx.productVariant.update({
          where: { id: variantId },
          data: { priceXof: -50 },
        });
      }),
    ).rejects.toThrow();
    expect(
      (await db.inventory.findUniqueOrThrow({ where: { variantId } })).onHand,
    ).toBe(1);
  });
  it("interdit un rôle arbitraire", async () => {
    await expect(
      db.role.create({ data: { id: "SUPERUSER" } }),
    ).rejects.toThrow();
  });
});
