import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { demoProducts } from "./demo-data";

if (
  !["development", "demo", "test"].includes(process.env.APP_ENV ?? "") ||
  process.env.VERCEL_ENV === "production"
)
  throw new Error("Catalogue de démonstration interdit en production.");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL requis.");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  for (const [index, p] of demoProducts.entries()) {
    await db.$transaction(async (tx) => {
      const category = await tx.category.upsert({
        where: { slug: p.categorySlug },
        update: {},
        create: { slug: p.categorySlug, name: p.category },
      });
      await tx.product.upsert({
        where: { id: `demo-${p.key}` },
        update: {},
        create: {
          id: `demo-${p.key}`,
          slug: p.key,
          name: p.name,
          description: p.description,
          status: "PUBLISHED",
          isDemo: true,
          categoryId: category.id,
          createdAt: new Date(Date.UTC(2026, 9, 29, 12, index)),
          images: { create: { objectKey: p.image, alt: p.name, position: 0 } },
          variants: {
            create: p.variants.map((v) => ({
              id: `demo-${p.key}-${v.key}`,
              sku: `DEMO-${p.key}-${v.key}`,
              label: v.label,
              priceXof: v.price,
              inventory: { create: { onHand: v.stock } },
              ...(v.stock > 0
                ? {
                    movements: {
                      create: {
                        type: "INITIAL" as const,
                        quantity: v.stock,
                        reason: "Stock fictif de démonstration",
                        operationKey: `seed-demo-${p.key}-${v.key}`,
                      },
                    },
                  }
                : {}),
            })),
          },
        },
      });
    });
  }
  console.log(
    "Catalogue de démonstration prêt. Prix et stocks fictifs, aucune vente réelle.",
  );
} finally {
  await db.$disconnect();
}
