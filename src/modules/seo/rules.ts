import type { CatalogProduct } from "@/modules/catalog/types";

export function indexingAllowed(input: Record<string, string | undefined>) {
  return (
    input.APP_ENV === "production" &&
    input.SEO_INDEXING === "enabled" &&
    input.VERCEL_ENV !== "preview" &&
    input.CHECKOUT_MODE !== "demo"
  );
}
export function canonicalUrl(origin: string, path: string) {
  const url = new URL(path, origin);
  if (url.origin !== new URL(origin).origin)
    throw new Error("Canonical origin mismatch");
  url.search = "";
  url.hash = "";
  return url.toString();
}
export function productStructuredData(
  product: CatalogProduct,
  origin: string,
  enabled: boolean,
) {
  if (!enabled || product.isDemo) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category.name,
    url: canonicalUrl(origin, `/produits/${encodeURIComponent(product.slug)}`),
    image: product.images.map((image) => canonicalUrl(origin, image.src)),
    // No Offer, review or rating until commercial selling conditions are validated.
  };
}
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
export function sitemapPaths(products: CatalogProduct[], enabled: boolean) {
  return enabled
    ? [
        "/",
        "/catalogue",
        "/contact",
        ...products
          .filter((p) => !p.isDemo)
          .map((p) => `/produits/${encodeURIComponent(p.slug)}`),
      ]
    : [];
}
