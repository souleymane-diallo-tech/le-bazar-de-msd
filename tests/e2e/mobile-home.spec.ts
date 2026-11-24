import { expect, test } from "@playwright/test";

test("accueil : offres, cibles tactiles et panier fixe sur mobile", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(4);
    const boxes = await cards.evaluateAll((elements) =>
      elements.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.x, y: r.y };
      }),
    );
    expect(boxes[0].y).toBe(boxes[1].y);
    expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
    if (width < 1024) expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const search = page.getByRole("searchbox", {
      name: "Chercher dans la boutique",
    });
    await expect(search).toBeInViewport();
    const controls = [
      search,
      page.getByRole("button", { name: "Lancer la recherche" }),
      page.getByRole("link", { name: /^Panier,/ }),
      page.getByRole("link", { name: "Découvrir", exact: true }),
    ];
    for (const control of controls) {
      const box = await control.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
    if (width === 390)
      await expect(cards.first().getByText(/FCFA/)).toBeInViewport({
        ratio: 1,
      });
    await page
      .getByRole("heading", { name: "Votre commande, en toute simplicité" })
      .scrollIntoViewIfNeeded();
    await expect(page.getByRole("link", { name: /^Panier,/ })).toBeInViewport();
  }
});

test("recherche au clavier, catégories et panier depuis l’accueil mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller au contenu" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /^Panier,/ })).toBeFocused();
  await page.keyboard.press("Tab");
  const search = page.getByRole("searchbox", {
    name: "Chercher dans la boutique",
  });
  await expect(search).toBeFocused();
  await search.fill("savon");
  await search.press("Enter");
  await expect(page).toHaveURL(/catalogue\?q=savon/);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Distributeur de savon", exact: true }),
  ).toBeVisible();
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Nos univers" })
    .getByRole("link", { name: "Salle de bain" })
    .click();
  await expect(page).toHaveURL(/category=salle-de-bain/);
  await expect(page.getByRole("article")).toHaveCount(2);
  await page.getByRole("link", { name: /^Panier,/ }).click();
  await expect(page).toHaveURL(/\/panier$/);
});
