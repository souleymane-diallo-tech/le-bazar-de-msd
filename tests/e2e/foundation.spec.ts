import { test, expect } from "@playwright/test";

test("accueil lisible aux cinq largeurs prévues", async ({
  page,
}, testInfo) => {
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Les petits détails/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explorer la collection" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width === 390 || width === 1440) {
      await page.screenshot({
        path: testInfo.outputPath(`accueil-${width}.png`),
        fullPage: true,
      });
    }
  }
});

test("administration et endpoint privé refusent les visiteurs", async ({
  page,
  request,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/connexion$/);
  await expect(page.getByLabel("Adresse e-mail")).toBeVisible();
  expect((await request.get("/api/admin/status")).status()).toBe(401);
});

test("inscription publique et modification de rôle impossibles", async ({
  request,
}) => {
  const response = await request.post("/api/auth/sign-up/email", {
    data: {
      name: "Intrus",
      email: "intrus@example.test",
      password: "InvalidSignup123!",
      roleId: "OWNER",
    },
  });
  expect(response.status()).toBe(404);
  expect(
    (
      await request.post("/api/auth/update-user", { data: { roleId: "OWNER" } })
    ).status(),
  ).toBe(404);
});

test("le lien d'évitement est utilisable au clavier", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller au contenu" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenu$/);
});

test("limite les tentatives de connexion répétées", async ({ request }) => {
  let status = 0;
  for (let attempt = 0; attempt < 7; attempt++) {
    const response = await request.post("/api/auth/sign-in/email", {
      headers: { Origin: "http://localhost:3000" },
      data: {
        email: "absent@example.test",
        password: "InvalidPasswordForRateLimit!",
      },
    });
    status = response.status();
    if (status === 429) break;
  }
  expect(status).toBe(429);
});
