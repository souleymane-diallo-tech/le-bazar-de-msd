import { z } from "zod";
import type { CatalogProduct } from "../catalog/types";

export const MAX_CART_QUANTITY = 99;
export const cartSchema = z.object({
  version: z.literal(1),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1).max(100),
        quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
        // Informational comparison only: never used to calculate the amount due.
        seenPriceXof: z.number().int().min(0).max(2147483647).optional(),
      }),
    )
    .max(50),
});
export type CartItem = z.infer<typeof cartSchema>["items"][number];
export function normalizeCart(items: CartItem[]): CartItem[] {
  const grouped = new Map<string, CartItem>();
  for (const item of items) {
    const previous = grouped.get(item.variantId);
    grouped.set(item.variantId, {
      ...previous,
      ...item,
      quantity: Math.min(
        MAX_CART_QUANTITY,
        (previous?.quantity ?? 0) + item.quantity,
      ),
    });
  }
  return [...grouped.values()];
}
export function parseCart(raw: string | null): CartItem[] {
  try {
    const parsed = cartSchema.safeParse(JSON.parse(raw ?? "null"));
    return parsed.success ? normalizeCart(parsed.data.items) : [];
  } catch {
    return [];
  }
}

export function quoteCart(items: CartItem[], products: CatalogProduct[]) {
  const lines = normalizeCart(items).map((item) => {
    const product = products.find((p) =>
      p.variants.some((v) => v.id === item.variantId),
    );
    const variant = product?.variants.find((v) => v.id === item.variantId);
    if (!product || !variant)
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        name: "Article indisponible",
        label: "",
        slug: null,
        image: null,
        priceXof: null,
        priceChanged: false,
        lineTotalXof: 0,
        available: 0,
        isDemo: false,
        issue: "Ce produit n’est plus disponible.",
      };
    return {
      variantId: item.variantId,
      quantity: item.quantity,
      name: product.name,
      label: variant.label,
      slug: product.slug,
      image: variant.image ?? product.images[0]?.src ?? null,
      priceXof: variant.priceXof,
      priceChanged:
        item.seenPriceXof !== undefined &&
        item.seenPriceXof !== variant.priceXof,
      lineTotalXof: variant.priceXof * item.quantity,
      available: variant.available,
      isDemo: product.isDemo,
      issue:
        item.quantity > variant.available
          ? `Stock disponible : ${variant.available}. Modifiez la quantité ou retirez l’article.`
          : null,
    };
  });
  return {
    lines,
    subtotalXof: lines.reduce((sum, line) => sum + line.lineTotalXof, 0),
    hasIssues: lines.some((line) => line.issue !== null),
  };
}
export type CartQuote = ReturnType<typeof quoteCart>;
