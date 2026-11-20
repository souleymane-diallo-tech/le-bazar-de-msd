import { expect, it } from "vitest";
import {
  emptySettings,
  publicSettingsFromJson,
  publicSettingsSchema,
  whatsappLink,
} from "@/modules/settings/rules";
import {
  canonicalUrl,
  indexingAllowed,
  productStructuredData,
  serializeJsonLd,
  sitemapPaths,
} from "@/modules/seo/rules";
import { parseEnvironment } from "@/lib/env";
import type { CatalogProduct } from "@/modules/catalog/types";
const product: CatalogProduct = {
  id: "test",
  slug: "objet-test",
  name: "Objet test",
  description: "Description </script><script>alert(1)</script>",
  isDemo: false,
  category: { slug: "maison", name: "Maison" },
  images: [{ src: "/images/horloge.jpg", alt: "Horloge" }],
  variants: [],
  createdAt: "2026-10-31T00:00:00Z",
};
it("normalise WhatsApp et encode le message sans changer sa destination", () => {
  const link = new URL(whatsappLink("+1 (202) 555-0123", "Bonjour & test #1")!);
  expect(link.origin + link.pathname).toBe("https://wa.me/12025550123");
  expect(link.searchParams.get("text")).toBe("Bonjour & test #1");
  expect(whatsappLink("javascript:alert(1)", "test")).toBeNull();
  expect(whatsappLink("", "test")).toBeNull();
});
it("refuse protocoles, faux domaines, identifiants et redirections sociales", () => {
  for (const facebook of [
    "http://facebook.com/test",
    "https://facebook.com.evil.test/test",
    "https://user:pass@facebook.com/test",
    "https://facebook.com/l.php?u=https://evil.test",
    "javascript:alert(1)",
  ]) {
    expect(
      publicSettingsSchema.safeParse({ ...emptySettings, facebook }).success,
    ).toBe(false);
  }
  expect(
    publicSettingsSchema.safeParse({
      ...emptySettings,
      facebook: "https://www.facebook.com/msd_demo_test",
    }).success,
  ).toBe(true);
});
it("les données de configuration malformées ne créent pas de liens publics", () => {
  expect(
    publicSettingsFromJson(
      { whatsapp: "bad" },
      { instagram: "javascript:bad" },
    ),
  ).toEqual(emptySettings);
});
it("indexation fermée par défaut, interdite en démo et Preview", () => {
  expect(indexingAllowed({})).toBe(false);
  expect(indexingAllowed({ APP_ENV: "demo", SEO_INDEXING: "enabled" })).toBe(
    false,
  );
  expect(
    indexingAllowed({
      APP_ENV: "production",
      SEO_INDEXING: "enabled",
      VERCEL_ENV: "preview",
    }),
  ).toBe(false);
  expect(
    indexingAllowed({ APP_ENV: "production", SEO_INDEXING: "enabled" }),
  ).toBe(true);
  const base = {
    APP_ENV: "demo",
    APP_URL: "https://example.test",
    DATABASE_URL: "postgresql://test:test@localhost/test",
    BETTER_AUTH_SECRET: "x".repeat(48),
    SEO_INDEXING: "enabled",
  };
  expect(() => parseEnvironment(base)).toThrow("indexation");
});
it("canonical et partage retirent paramètres et fragments, refusent une autre origine", () => {
  expect(
    canonicalUrl(
      "https://example.test",
      "/produits/objet?utm_source=test#secret",
    ),
  ).toBe("https://example.test/produits/objet");
  expect(() =>
    canonicalUrl("https://example.test", "https://evil.test/"),
  ).toThrow();
});
it("sitemap fermé en démo, uniquement pages publiques et produits réels ensuite", () => {
  expect(sitemapPaths([product], false)).toEqual([]);
  expect(
    sitemapPaths([product, { ...product, slug: "fictif", isDemo: true }], true),
  ).toEqual(["/", "/catalogue", "/contact", "/produits/objet-test"]);
});
it("JSON-LD sans faux prix ni avis et résistant à la fermeture du script", () => {
  expect(
    productStructuredData(
      { ...product, isDemo: true },
      "https://example.test",
      true,
    ),
  ).toBeNull();
  expect(
    productStructuredData(product, "https://example.test", false),
  ).toBeNull();
  const data = productStructuredData(product, "https://example.test", true);
  expect(data).not.toHaveProperty("offers");
  expect(data).not.toHaveProperty("aggregateRating");
  expect(serializeJsonLd(data)).not.toContain("</script>");
  expect(JSON.parse(serializeJsonLd(data)).description).toBe(
    product.description,
  );
});
