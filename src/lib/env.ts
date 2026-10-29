import { z } from "zod";

const schema = z.object({
  APP_ENV: z
    .enum(["development", "test", "demo", "production"])
    .default("development"),
  APP_URL: z.url(),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((value) => /^postgres(ql)?:\/\//.test(value)),
  BETTER_AUTH_SECRET: z.string().min(32),
  PAYMENT_MODE: z.enum(["disabled", "sandbox", "live"]).default("disabled"),
});

export function parseEnvironment(input: Record<string, string | undefined>) {
  const result = schema.safeParse(input);
  if (!result.success) {
    // Never include values or connection strings in logs or errors.
    throw new Error(
      `Configuration serveur invalide : ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  }
  const env = result.data;
  if (
    env.APP_ENV !== "development" &&
    env.APP_ENV !== "test" &&
    !env.APP_URL.startsWith("https://")
  ) {
    throw new Error("HTTPS requis en démonstration et en production.");
  }
  // Phase 2 has no payment adapters. Explicitly reject premature activation.
  if (env.PAYMENT_MODE !== "disabled") {
    throw new Error(
      "Les paiements électroniques ne sont pas activés dans ce socle.",
    );
  }
  if (input.VERCEL_ENV === "production" && env.APP_ENV !== "production") {
    throw new Error(
      "Une configuration de démonstration ne peut pas être promue en production.",
    );
  }
  if (input.VERCEL_ENV === "preview" && env.APP_ENV !== "demo") {
    throw new Error(
      "Une Preview doit utiliser APP_ENV=demo et des données isolées.",
    );
  }
  return env;
}

export function getEnvironment() {
  return parseEnvironment(process.env);
}
