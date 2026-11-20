import type { PrismaClient } from "@/generated/prisma/client";
import { authorize, audit, serial } from "@/modules/orders/service";
import { CommerceError } from "@/modules/orders/rules";
import { settingsInputSchema } from "./rules";

export async function savePublicSettings(
  db: PrismaClient,
  actorId: string,
  input: unknown,
) {
  const data = settingsInputSchema.parse(input);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "settings:write");
    const current = await tx.storeSettings.findUnique({
      where: { id: "store" },
    });
    if ((current?.version ?? 0) !== data.version)
      throw new CommerceError("CONFLICT");
    const contacts = { whatsapp: data.whatsapp };
    const socialLinks = {
      facebook: data.facebook,
      instagram: data.instagram,
      tiktok: data.tiktok,
    };
    await tx.storeSettings.upsert({
      where: { id: "store" },
      create: { name: "Le Bazar de MSD", contacts, socialLinks, version: 1 },
      update: { contacts, socialLinks, version: { increment: 1 } },
    });
    // Public contact values are intentionally kept out of logs and audit payloads.
    await audit(
      tx,
      actorId,
      "settings.public.update",
      "StoreSettings",
      "store",
      {
        fields: ["whatsapp", "facebook", "instagram", "tiktok"],
        previousVersion: data.version,
      },
    );
  });
}
