import { expect, test } from "@playwright/test";

test("catalogue responsive : grille, filtres et cibles tactiles", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/catalogue");
    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(4);
    const positions = await cards.evaluateAll((es) =>
      es.map((e) => ({
        x: e.getBoundingClientRect().x,
        y: e.getBoundingClientRect().y,
      })),
    );
    expect(positions[0].y).toBe(positions[1].y);
    if (width < 1024) expect(positions[2].y).toBeGreaterThan(positions[0].y);
    else expect(positions[3].y).toBe(positions[0].y);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 390)
      await expect(cards.first().getByText(/FCFA/)).toBeInViewport({
        ratio: 1,
      });
    if (width < 768) {
      const toggle = page.getByRole("button", { name: "Filtres", exact: true });
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByLabel("Catégorie", { exact: true })).toBeHidden();
      await toggle.press("Enter");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
    }
    for (const control of [
      page.getByLabel("Catégorie", { exact: true }),
      page.getByLabel("Rechercher un produit"),
      page.getByLabel("Trier par"),
      page.getByRole("button", { name: "Afficher", exact: true }),
    ]) {
      await expect(control).toBeVisible();
      const bounds = await control.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("filtres mobiles conservés, suppression indépendante et retour fiche", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalogue");
  await page.getByRole("button", { name: "Filtres", exact: true }).click();
  await page.getByLabel("Rechercher un produit").fill("savon");
  await page
    .getByLabel("Catégorie", { exact: true })
    .selectOption("salle-de-bain");
  await page.getByLabel("Trier par").selectOption("price-desc");
  await page.getByRole("button", { name: "Afficher", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Retirer la recherche", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(2);
  await expect(page.getByLabel("Trier par")).toHaveValue("price-desc");
  await expect(page.locator("article h2")).toHaveText([
    "Rangements muraux",
    "Distributeur de savon",
  ]);
  const filteredUrl = page.url();
  await page
    .getByRole("link", { name: "Découvrir Rangements muraux", exact: true })
    .click();
  await expect(page).toHaveURL(/\/produits\/rangements$/);
  await page.goBack();
  await expect(page).toHaveURL(filteredUrl);
  await expect(page.getByRole("article")).toHaveCount(2);
  await page.getByRole("button", { name: /^Filtres/ }).click();
  await expect(page.getByLabel("Catégorie", { exact: true })).toHaveValue(
    "salle-de-bain",
  );
  await page
    .getByRole("link", { name: "Retirer la catégorie", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(4);
  await expect(page.getByLabel("Trier par")).toHaveValue("price-desc");
});

test("recherche sans résultat, texte long et réinitialisation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`/catalogue?q=${"z".repeat(100)}&category=salle-de-bain`);
  await expect(
    page.getByRole("heading", { name: "Aucun produit trouvé" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("link", { name: "Voir toute la collection", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(4);
  await page.getByRole("button", { name: "Filtres", exact: true }).click();
  await expect(page.getByLabel("Rechercher un produit")).toHaveValue("");
  await expect(page.getByLabel("Catégorie", { exact: true })).toHaveValue("");
});
