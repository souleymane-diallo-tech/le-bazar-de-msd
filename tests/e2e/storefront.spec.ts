import { expect, test } from "@playwright/test";

test("recherche, filtre et tri du catalogue", async ({ page }) => {
  await page.goto("/catalogue");
  await expect(
    page.getByRole("heading", { name: "La collection", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Rechercher un produit").fill("savon");
  await page.getByRole("button", { name: "Afficher", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Distributeur de savon", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Horloge numérique", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Effacer les filtres" }).click();
  await page
    .getByLabel("Catégorie", { exact: true })
    .selectOption("salle-de-bain");
  await page.getByLabel("Trier par").selectOption("price-desc");
  await page.getByRole("button", { name: "Afficher", exact: true }).click();
  await expect(page.locator("article h2")).toHaveText([
    "Rangements muraux",
    "Distributeur de savon",
  ]);
  await page.getByLabel("Rechercher un produit").fill("aucun-resultat-xyz");
  await page.getByRole("button", { name: "Afficher", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Aucun produit trouvé" }),
  ).toBeVisible();
});

test("fiche, panier persistant, quantités et suppression", async ({ page }) => {
  await page.goto("/produits/distributeur");
  await page.getByLabel("Quantité", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Article ajouté" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Voir mon panier" }).click();
  const quantity = page.getByLabel("Quantité pour Distributeur de savon");
  await expect(quantity).toHaveValue("2");
  await page.reload();
  await expect(quantity).toHaveValue("2");
  await quantity.selectOption("3");
  await expect(
    page.getByText("37 500 FCFA", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Tester la commande" }),
  ).toHaveAttribute("href", "/commande");
  await page
    .getByRole("button", { name: "Retirer Distributeur de savon" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Votre panier attend ses essentiels." }),
  ).toBeVisible();
});

test("variante épuisée et limite du stock panier inclus", async ({ page }) => {
  await page.goto("/produits/ventilateur");
  await page.getByRole("radio", { name: "Argent · lot épuisé (test)" }).check();
  await expect(
    page.getByRole("button", { name: "Épuisé", exact: true }),
  ).toBeDisabled();
  await page.goto("/produits/horloge");
  await page.getByLabel("Quantité", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "panier inclus" }),
  ).toBeVisible();
});

test("devis serveur ignore les prix falsifiés et rejette les quantités invalides", async ({
  request,
}) => {
  const result = await request.post("/api/cart/quote", {
    data: {
      version: 1,
      items: [
        { variantId: "demo-distributeur-blanc", quantity: 2, priceXof: 1 },
      ],
    },
  });
  expect(result.status()).toBe(200);
  expect((await result.json()).subtotalXof).toBe(25000);
  expect(
    (
      await request.post("/api/cart/quote", {
        data: {
          version: 1,
          items: [{ variantId: "demo-distributeur-blanc", quantity: -1 }],
        },
      })
    ).status(),
  ).toBe(400);
  const missing = await request.post("/api/cart/quote", {
    data: { version: 1, items: [{ variantId: "not-public", quantity: 1 }] },
  });
  expect((await missing.json()).hasIssues).toBe(true);
});

test("stockage corrompu et produit inconnu sans erreur applicative", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("msd.cart.v1", "broken"));
  await page.goto("/panier");
  await expect(
    page.getByRole("heading", { name: "Votre panier attend ses essentiels." }),
  ).toBeVisible();
  const response = await page.goto("/produits/inexistant");
  expect(response?.status()).toBe(404);
});

test("panier ancien : changement de prix et quantité devenue indisponible", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "msd.cart.v1",
      JSON.stringify({
        version: 1,
        items: [
          {
            variantId: "demo-distributeur-blanc",
            quantity: 99,
            seenPriceXof: 1,
          },
        ],
      }),
    ),
  );
  await page.goto("/panier");
  await expect(
    page.getByRole("status").filter({ hasText: "Le prix a changé" }),
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "Stock disponible : 8" }),
  ).toBeVisible();
});

test("catalogue, fiche et panier aux cinq largeurs", async ({ page }, info) => {
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/catalogue", "/produits/distributeur", "/panier"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: info.outputPath(`${path.replaceAll("/", "-")}-${width}.png`),
          fullPage: true,
        });
    }
  }
});
