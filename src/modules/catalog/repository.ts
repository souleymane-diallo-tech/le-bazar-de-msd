import type { PrismaClient } from "@/generated/prisma/client";
import type { CatalogProduct } from "./types";

// Only known local assets are currently served; object-storage URLs require a validated allowlist in a later phase.
const imagePaths = new Set([
  "/images/maison.jpg",
  "/images/distributeur.jpg",
  "/images/ventilateur.jpg",
  "/images/horloge.jpg",
]);
export function safeImage(value: string): string | null {
  return imagePaths.has(value) ? value : null;
}

export async function readPublicCatalog(
  db: PrismaClient,
  allowDemo: boolean,
): Promise<CatalogProduct[]> {
  const products = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      archivedAt: null,
      category: { active: true },
      ...(allowDemo ? {} : { isDemo: false }),
      variants: { some: { active: true } },
    },
    include: {
      category: true,
      variants: {
        where: { active: true },
        include: { inventory: true },
        orderBy: { id: "asc" },
      },
      images: { orderBy: [{ position: "asc" }, { id: "asc" }] },
    },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  });
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    isDemo: p.isDemo,
    category: { name: p.category.name, slug: p.category.slug },
    createdAt: p.createdAt.toISOString(),
    images: p.images.flatMap((image) => {
      const src = safeImage(image.objectKey);
      return src ? [{ src, alt: image.alt }] : [];
    }),
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      sku: v.sku,
      priceXof: v.priceXof,
      available: Math.max(
        0,
        (v.inventory?.onHand ?? 0) - (v.inventory?.reserved ?? 0),
      ),
      image: safeImage(
        p.images.find((img) => img.variantId === v.id)?.objectKey ?? "",
      ),
    })),
  }));
}
