import { expect, it } from "vitest";
import { parseEnvironment } from "@/lib/env";

const base = {
  APP_ENV: "development",
  APP_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://test:test@localhost/test",
  BETTER_AUTH_SECRET: "a".repeat(48),
  PAYMENT_MODE: "disabled",
};
it("checkout désactivé par défaut et démo interdite en production", () => {
  expect(parseEnvironment(base).CHECKOUT_MODE).toBe("disabled");
  expect(() =>
    parseEnvironment({
      ...base,
      APP_ENV: "production",
      APP_URL: "https://example.test",
      CHECKOUT_MODE: "demo",
    }),
  ).toThrow("checkout");
});

it("autorise une configuration locale valide", () => {
  expect(parseEnvironment(base).APP_ENV).toBe("development");
});
it("refuse les secrets trop courts sans en exposer la valeur", () => {
  expect(() =>
    parseEnvironment({ ...base, BETTER_AUTH_SECRET: "secret-never-log" }),
  ).toThrow("BETTER_AUTH_SECRET");
  expect(() =>
    parseEnvironment({ ...base, BETTER_AUTH_SECRET: "secret-never-log" }),
  ).not.toThrow("secret-never-log");
});
it("interdit HTTP dans une démo distante", () => {
  expect(() => parseEnvironment({ ...base, APP_ENV: "demo" })).toThrow("HTTPS");
});
it("interdit l'activation anticipée d'un paiement", () => {
  expect(() => parseEnvironment({ ...base, PAYMENT_MODE: "live" })).toThrow(
    "paiements",
  );
});
it("empêche la promotion implicite d'une démo en production", () => {
  expect(() => parseEnvironment({ ...base, VERCEL_ENV: "production" })).toThrow(
    "production",
  );
});
it("impose des paramètres demo aux previews", () => {
  expect(() => parseEnvironment({ ...base, VERCEL_ENV: "preview" })).toThrow(
    "Preview",
  );
});
