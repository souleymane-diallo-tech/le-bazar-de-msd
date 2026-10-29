import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL requis.");
if (!["development", "test", "demo"].includes(process.env.APP_ENV ?? "")) {
  throw new Error(
    "Le seed nécessite un environnement non productif explicite.",
  );
}
if (
  process.env.APP_ENV === "production" ||
  process.env.VERCEL_ENV === "production"
)
  throw new Error("Seed interdit en production.");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  await db.$transaction([
    db.role.upsert({
      where: { id: "OWNER" },
      update: {},
      create: { id: "OWNER" },
    }),
    db.role.upsert({
      where: { id: "MANAGER" },
      update: {},
      create: { id: "MANAGER" },
    }),
    db.storeSettings.upsert({
      where: { id: "store" },
      update: {},
      create: { id: "store", name: "Le Bazar de MSD" },
    }),
  ]);
  console.log(
    "Paramètres de démonstration initialisés ; aucun compte, produit ou prix inventé.",
  );
} finally {
  await db.$disconnect();
}
