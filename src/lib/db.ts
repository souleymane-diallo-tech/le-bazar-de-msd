import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getEnvironment } from "@/lib/env";

const globalDb = globalThis as unknown as { msdPrisma?: PrismaClient };

export function getDb() {
  if (!globalDb.msdPrisma) {
    const env = getEnvironment();
    globalDb.msdPrisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: env.DATABASE_URL,
        max: 3,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
      }),
    });
  }
  return globalDb.msdPrisma;
}
