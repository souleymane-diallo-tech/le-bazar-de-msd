import { describe, expect, it } from "vitest";
import { parseCatalogQuery, selectCatalog } from "@/modules/catalog/rules";
import { parseCart, cartSchema, quoteCart } from "@/modules/cart/rules";
import type { CatalogProduct } from "@/modules/catalog/types";

const products: CatalogProduct[] = [
  {
    id: "b",
    slug: "savon",
    name: "Distributeur épuré",
    description: "Savon",
    isDemo: true,
    category: { name: "Bain", slug: "bain" },
    images: [],
    createdAt: "2026-10-29",
    variants: [
      {
        id: "v1",
        label: "Blanc",
        sku: "T1",
        priceXof: 5000,
        available: 2,
        image: null,
      },
    ],
  },
  {
    id: "a",
    slug: "horloge",
    name: "Horloge",
    description: "Décoration",
    isDemo: false,
    category: { name: "Maison", slug: "maison" },
    images: [],
    createdAt: "2026-10-29",
    variants: [
      {
        id: "v2",
        label: "Noir",
        sku: "T2",
        priceXof: 1000,
        available: 4,
        image: null,
      },
    ],
  },
];
describe("catalogue", () => {
  it("combine recherche sans accents, catégorie et tri", () => {
    const result = selectCatalog(
      products,
      parseCatalogQuery({
        q: "epure savon",
        category: "bain",
        sort: "price-asc",
      }),
    );
    expect(result.items.map((p) => p.id)).toEqual(["b"]);
  });
  it("trie les prix et stabilise les égalités", () => {
    expect(
      selectCatalog(
        products,
        parseCatalogQuery({ sort: "price-asc" }),
      ).items.map((p) => p.id),
    ).toEqual(["a", "b"]);
    expect(
      selectCatalog(products, parseCatalogQuery({})).items.map((p) => p.id),
    ).toEqual(["a", "b"]);
  });
  it("borne une page hors limites et résiste aux paramètres invalides", () => {
    const query = parseCatalogQuery({ page: "-2", q: ["a", "b"], sort: "sql" });
    expect(query).toEqual({ page: 1, q: "", category: "", sort: "recent" });
    expect(selectCatalog(products, { ...query, page: 99 }, 1).page).toBe(2);
  });
});
describe("panier", () => {
  it("signale un changement de prix sans utiliser l'ancien montant", () => {
    const result = quoteCart(
      [{ variantId: "v1", quantity: 2, seenPriceXof: 1 }],
      products,
    );
    expect(result.lines[0].priceChanged).toBe(true);
    expect(result.subtotalXof).toBe(10000);
  });
  it("ignore un stockage corrompu ou une version inconnue", () => {
    expect(parseCart("broken")).toEqual([]);
    expect(parseCart('{"version":2,"items":[]}')).toEqual([]);
  });
  it("fusionne les doublons et borne les quantités", () => {
    expect(
      parseCart(
        JSON.stringify({
          version: 1,
          items: [
            { variantId: "v1", quantity: 60 },
            { variantId: "v1", quantity: 60 },
          ],
        }),
      ),
    ).toEqual([{ variantId: "v1", quantity: 99 }]);
  });
  it("refuse les quantités négatives, fractionnelles ou les paniers excessifs", () => {
    for (const quantity of [-1, 0, 1.5, 100])
      expect(
        cartSchema.safeParse({
          version: 1,
          items: [{ variantId: "v1", quantity }],
        }).success,
      ).toBe(false);
    expect(
      cartSchema.safeParse({
        version: 1,
        items: Array(51).fill({ variantId: "v1", quantity: 1 }),
      }).success,
    ).toBe(false);
  });
  it("calcule depuis les données serveur et signale les ruptures", () => {
    const result = quoteCart(
      [
        { variantId: "v1", quantity: 3 },
        { variantId: "gone", quantity: 1 },
      ],
      products,
    );
    expect(result.subtotalXof).toBe(15000);
    expect(result.hasIssues).toBe(true);
    expect(result.lines[1].priceXof).toBeNull();
  });
  it("ne fait pas confiance à un prix reçu du client", () => {
    const request = cartSchema.parse({
      version: 1,
      items: [{ variantId: "v1", quantity: 2, priceXof: 1 }],
      subtotalXof: 2,
    });
    expect(quoteCart(request.items, products).subtotalXof).toBe(10000);
  });
});
