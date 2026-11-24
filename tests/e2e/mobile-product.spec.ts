import { expect, test } from "@playwright/test";

test("fiche mobile : prix, action persistante et absence de débordement", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/produits/distributeur");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const add = page.getByRole("button", {
      name: "Ajouter au panier",
      exact: true,
    });
    if (width < 1024) {
      await expect(add).toBeInViewport({ ratio: 1 });
      await page
        .getByRole("heading", { name: "À découvrir aussi" })
        .scrollIntoViewIfNeeded();
      await expect(add).toBeInViewport({ ratio: 1 });
    }
    const box = await add.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    if (width === 390) {
      await page.goto("/produits/distributeur");
      await expect(
        page.getByText("12 500 FCFA", { exact: true }).first(),
      ).toBeInViewport({ ratio: 1 });
    }
  }
});

test("ajout mobile : confirmation visible, quantité et rupture", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/produits/distributeur");
  await page.getByLabel("Quantité", { exact: true }).fill("2");
  await page
    .getByRole("button", { name: "Ajouter au panier", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Article ajouté" }),
  ).toBeInViewport({ ratio: 1 });
  await page
    .getByRole("link", { name: "Voir mon panier →", exact: true })
    .click();
  await expect(
    page.getByLabel("Quantité pour Distributeur de savon"),
  ).toHaveValue("2");
  await page.goto("/produits/ventilateur");
  await page.getByRole("radio", { name: /lot épuisé/ }).check();
  await expect(
    page.getByRole("button", { name: "Épuisé", exact: true }),
  ).toBeDisabled();
  await expect(page.getByLabel("Quantité", { exact: true })).toBeDisabled();
});

test("retour explicite conserve les filtres et refuse une destination externe", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalogue?category=salle-de-bain&sort=price-desc");
  await page
    .getByRole("link", { name: "Découvrir Rangements muraux", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Retour à la collection", exact: true })
    .click();
  await expect(page.getByLabel("Trier par")).toHaveValue("price-desc");
  await expect(page.getByRole("article")).toHaveCount(2);
  await page.goto("/produits/horloge?retour=https%3A%2F%2Fexample.com");
  await expect(
    page.getByRole("link", { name: "Retour à la collection", exact: true }),
  ).toHaveAttribute("href", "/catalogue");
});
