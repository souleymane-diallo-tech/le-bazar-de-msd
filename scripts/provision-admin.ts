import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import { PrismaClient } from "../src/generated/prisma/client";

// JSON on stdin, never passwords in shell arguments or output.
const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
const input = z
  .object({
    email: z.email().transform((v) => v.toLowerCase()),
    name: z.string().min(1).max(100),
    password: z.string().min(12).max(128),
    role: z.enum(["OWNER", "MANAGER"]).default("OWNER"),
  })
  .safeParse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
if (!input.success)
  throw new Error(
    "Entrée invalide ; email, name, password (12 caractères minimum), role requis.",
  );
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL requis.");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  const password = await hashPassword(input.data.password);
  await db.$transaction(async (tx) => {
    await tx.role.upsert({
      where: { id: input.data.role },
      update: {},
      create: { id: input.data.role },
    });
    const id = randomUUID();
    await tx.user.create({
      data: {
        id,
        name: input.data.name,
        email: input.data.email,
        roleId: input.data.role,
        emailVerified: false,
        accounts: {
          create: { providerId: "credential", accountId: id, password },
        },
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: id,
        action: "USER_PROVISIONED",
        targetType: "User",
        targetId: id,
        safeDiff: { role: input.data.role, source: "operator-cli" },
        operationKey: randomUUID(),
      },
    });
  });
  console.log("Compte créé. Aucun identifiant secret n’est affiché.");
} finally {
  await db.$disconnect();
}
