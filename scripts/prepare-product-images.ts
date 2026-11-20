import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { get, put } from "@vercel/blob";

// Read-only by default. --apply copies referenced images, never deletes originals or modifies SQL data.
const apply = process.argv.includes("--apply");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL requis");
let source: URL;
try {
  source = new URL(url);
} catch {
  throw new Error("Configuration de base invalide");
}
if (
  !["localhost", "127.0.0.1"].includes(source.hostname) ||
  !source.pathname.endsWith("_dev")
)
  throw new Error("Base source locale dédiée requise");
if (apply && !process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
  throw new Error("Stockage privé cible non configuré");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});
try {
  const records = await db.productImage.findMany({
    select: { objectKey: true },
  });
  const names = [
    ...new Set(
      records
        .filter((r) => r.objectKey.startsWith("/media/products/"))
        .map((r) => r.objectKey.slice("/media/products/".length)),
    ),
  ];
  const verified: { name: string; bytes: Buffer }[] = [];
  for (const name of names) {
    if (!/^[a-f0-9]{64}\.webp$/.test(name))
      throw new Error("Référence média invalide");
    const bytes = await readFile(
      path.join(process.cwd(), ".local", "product-images", name),
    );
    if (`${createHash("sha256").update(bytes).digest("hex")}.webp` !== name)
      throw new Error("Empreinte média incohérente");
    verified.push({ name, bytes });
  }
  console.log(
    JSON.stringify({
      mode: apply ? "copy-and-verify" : "dry-run",
      referencedUploads: verified.length,
      bytes: verified.reduce((sum, r) => sum + r.bytes.length, 0),
      bundledPhotos: records.filter((r) => r.objectKey.startsWith("/images/"))
        .length,
    }),
  );
  if (apply)
    for (const { name, bytes } of verified) {
      await put(`products/${name}`, bytes, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/webp",
      });
      const result = await get(`products/${name}`, {
        access: "private",
        useCache: false,
      });
      if (!result || result.statusCode !== 200)
        throw new Error("Copie illisible");
      const copy = Buffer.from(await new Response(result.stream).arrayBuffer());
      if (!copy.equals(bytes)) throw new Error("Vérification de copie échouée");
    }
  console.log(
    apply
      ? "Copie vérifiée. Références SQL inchangées ; catalogue distant à vérifier séparément."
      : "Aucun transfert effectué. Fichiers de tests non référencés exclus.",
  );
} catch {
  console.error(
    "Préparation interrompue : vérifier fichiers, références et configuration privée. Aucun original supprimé.",
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
