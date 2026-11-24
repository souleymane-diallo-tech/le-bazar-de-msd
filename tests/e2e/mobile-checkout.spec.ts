import { expect, test } from "@playwright/test";

test("erreur près du champ, devis mobile et modification avant confirmation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/produits/distributeur");
  await page
    .getByRole("button", { name: "Ajouter au panier", exact: true })
    .click();
  await page.goto("/commande");
  await page.getByLabel("Nom fictif", { exact: true }).fill("Client test");
  await page.getByLabel("Téléphone fictif").fill("123");
  await page.getByLabel("Quartier fictif").fill("Quartier test");
  await page
    .getByLabel("Adresse fictive", { exact: true })
    .fill("Adresse fictive de recette");
  await page.getByRole("checkbox", { name: /Je comprends/ }).check();
  await page
    .getByRole("button", { name: "Vérifier le total", exact: true })
    .click();
  await expect(page.getByLabel("Téléphone fictif")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(
    page.getByText("Saisissez un numéro fictif au format +221770000000.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Téléphone fictif").fill("+221770000000");
  await page
    .getByRole("button", { name: "Vérifier le total", exact: true })
    .click();
  const summary = page.getByRole("region", {
    name: "Récapitulatif avant confirmation",
  });
  await expect(summary).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Confirmer la commande de test" }),
  ).toBeVisible();
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const button = await page
      .getByRole("button", { name: "Confirmer la commande de test" })
      .boundingBox();
    expect(button!.height).toBeGreaterThanOrEqual(44);
  }
  await page
    .getByLabel("Nom fictif", { exact: true })
    .fill("Client test modifié");
  await expect(
    page.getByRole("button", { name: "Confirmer la commande de test" }),
  ).toHaveCount(0);
});
