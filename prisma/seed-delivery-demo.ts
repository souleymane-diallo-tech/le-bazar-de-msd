import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
if (
  process.env.APP_ENV === "production" ||
  process.env.VERCEL_ENV === "production"
)
  throw new Error("Seed démo interdit en production");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  for (const [id, name, feeXof] of [
    ["demo-dakar", "Dakar · zone fictive", 1500],
    ["demo-peripherie", "Périphérie · zone fictive", 2500],
  ] as const) {
    await db.deliveryZone.upsert({
      where: { id },
      update: {},
      create: { id, name, feeXof, isDemo: true },
    });
  }
  console.log(
    "Deux zones de démonstration initialisées, sans écraser les modifications.",
  );
} finally {
  await db.$disconnect();
}
