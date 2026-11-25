import { expect, test } from "@playwright/test";

test("connexion interrompue et retour en haut sans mouvement imposé", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/catalogue");
  await context.setOffline(true);
  await expect(
    page.getByRole("status").filter({ hasText: "Connexion interrompue" }),
  ).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByText(/Connexion interrompue/)).toHaveCount(0);
  await page
    .getByRole("link", { name: "Espace équipe", exact: true })
    .scrollIntoViewIfNeeded();
  const up = page.getByRole("button", { name: "Revenir en haut de la page" });
  await expect(up).toBeInViewport();
  await up.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(
    page.getByRole("link", { name: "Aller au contenu" }),
  ).toBeFocused();
});

test("retrait annulable même après suppression du dernier article", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/produits/distributeur");
  await page
    .getByRole("button", { name: "Ajouter au panier", exact: true })
    .click();
  await page.goto("/panier");
  await page
    .getByRole("button", { name: "Retirer Distributeur de savon", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Votre panier attend ses essentiels." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Annuler le retrait", exact: true })
    .click();
  await expect(
    page.getByLabel("Quantité pour Distributeur de savon"),
  ).toHaveValue("1");
  await expect(
    page.getByRole("link", { name: "Tester la commande", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("photo défaillante et produit absent proposent un état utile", async ({
  page,
}) => {
  await page.route("**/_next/image**", (route) => route.abort());
  await page.goto("/produits/distributeur");
  await expect(
    page.getByRole("img", {
      name: "Distributeur de savon : image indisponible",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ajouter au panier", exact: true }),
  ).toBeEnabled();
  const response = await page.goto("/produits/article-inexistant-etats");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Cet article n’est plus disponible." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Voir la collection", exact: true })
    .click();
  await expect(page).toHaveURL(/\/catalogue$/);
});

test("devis en attente : ancien montant masqué et commande désactivée", async ({
  page,
}) => {
  await page.goto("/produits/distributeur");
  await page
    .getByRole("button", { name: "Ajouter au panier", exact: true })
    .click();
  await page.goto("/panier");
  await expect(
    page.getByRole("link", { name: "Tester la commande", exact: true }),
  ).toBeVisible();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/cart/quote", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page
      .getByLabel("Quantité pour Distributeur de savon")
      .selectOption("2");
    await expect(
      page.getByRole("button", {
        name: "Vérification du panier…",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole("status").filter({ hasText: "Vérification des prix" }),
    ).toBeVisible();
  } finally {
    release();
  }
  await expect(
    page.getByRole("link", { name: "Tester la commande", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("25 000 FCFA", { exact: true }).first(),
  ).toBeVisible();
});
