import { z } from "zod";
import type { CatalogProduct, CatalogQuery } from "./types";

export const querySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  category: z
    .string()
    .regex(/^[a-z0-9-]*$/)
    .max(80)
    .catch(""),
  sort: z.enum(["recent", "price-asc", "price-desc"]).catch("recent"),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});
export function parseCatalogQuery(
  values: Record<string, string | string[] | undefined>,
): CatalogQuery {
  return querySchema.parse(values);
}
export function minPrice(product: CatalogProduct) {
  return Math.min(...product.variants.map((v) => v.priceXof));
}
export function formatPrice(amount: number) {
  return `${new Intl.NumberFormat("fr-SN").format(amount)} FCFA`;
}
const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");

export function selectCatalog(
  products: CatalogProduct[],
  query: CatalogQuery,
  pageSize = 12,
) {
  const terms = fold(query.q).split(/\s+/).filter(Boolean);
  const items = products.filter(
    (p) =>
      (!query.category || p.category.slug === query.category) &&
      terms.every((term) =>
        fold(`${p.name} ${p.description} ${p.category.name}`).includes(term),
      ),
  );
  items.sort((a, b) => {
    const comparison =
      query.sort === "price-asc"
        ? minPrice(a) - minPrice(b)
        : query.sort === "price-desc"
          ? minPrice(b) - minPrice(a)
          : b.createdAt.localeCompare(a.createdAt);
    return comparison || a.id.localeCompare(b.id);
  });
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(query.page, pages);
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pages,
  };
}
