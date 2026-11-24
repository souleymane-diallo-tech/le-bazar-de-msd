import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/produits/distributeur");
  await page
    .getByRole("button", { name: "Ajouter au panier", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Article ajouté" }),
  ).toBeVisible();
});

test("panier aux cinq largeurs : total, quantités et commande accessibles", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/panier");
    const checkout = page.getByRole("link", {
      name: "Tester la commande",
      exact: true,
    });
    await expect(checkout).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width < 1024) await expect(checkout).toBeInViewport({ ratio: 1 });
    for (const control of [
      checkout,
      page.getByLabel("Quantité pour Distributeur de savon"),
      page.getByRole("button", {
        name: "Retirer Distributeur de savon",
        exact: true,
      }),
    ]) {
      const box = await control.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  }
});

test("quantité mobile, suppression et panier vide", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/panier");
  const quantity = page.getByLabel("Quantité pour Distributeur de savon");
  await quantity.selectOption("2");
  await expect(
    page.getByRole("link", { name: "Tester la commande", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("25 000 FCFA", { exact: true }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(quantity).toHaveValue("2");
  await page
    .getByRole("button", { name: "Retirer Distributeur de savon", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Votre panier attend ses essentiels." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Tester la commande", exact: true }),
  ).toHaveCount(0);
});

test("erreur de devis : commande bloquée et reprise sans perte", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let fail = true;
  await page.route("**/api/cart/quote", (route) =>
    fail ? route.fulfill({ status: 503, body: "{}" }) : route.continue(),
  );
  await page.goto("/panier");
  await expect(
    page.getByRole("alert").filter({ hasText: "Votre panier est conservé" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Panier à vérifier", exact: true }),
  ).toBeDisabled();
  fail = false;
  await page.getByRole("button", { name: "Réessayer", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Tester la commande", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Quantité pour Distributeur de savon"),
  ).toHaveValue("1");
});

test("stock insuffisant bloque la poursuite jusqu’à correction", async ({
  page,
}) => {
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
    page.getByRole("button", { name: "Panier à vérifier", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("alert").filter({ hasText: "Certains articles" }),
  ).toBeVisible();
  await page
    .getByLabel("Quantité pour Distributeur de savon")
    .selectOption("1");
  await expect(
    page.getByRole("link", { name: "Tester la commande", exact: true }),
  ).toBeVisible();
});
