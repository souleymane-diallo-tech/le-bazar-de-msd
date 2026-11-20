import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { get, put } from "@vercel/blob";
import { imageStorage } from "./storage-policy";

export const uploadName = /^[a-f0-9]{64}\.webp$/;
export const uploadsEnabled = () => imageStorage(process.env) !== "disabled";
const directory = () => path.join(process.cwd(), ".local", "product-images");
export class ImageUploadError extends Error {}

export async function normalizeProductImage(bytes: Buffer) {
  if (!bytes.length || bytes.length > 3 * 1024 * 1024)
    throw new ImageUploadError("La photo doit peser au maximum 3 Mo.");
  try {
    const image = sharp(bytes, {
      limitInputPixels: 20_000_000,
      failOn: "warning",
    });
    const info = await image.metadata();
    if (
      !info.format ||
      !["jpeg", "png", "webp"].includes(info.format) ||
      (info.pages ?? 1) > 1
    )
      throw new Error("Unsupported image");
    return await image
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new ImageUploadError(
      "Photo invalide : utilisez une image JPEG, PNG ou WebP non animée, de 20 mégapixels maximum.",
    );
  }
}
export async function storeProductImage(file: File) {
  if (!uploadsEnabled())
    throw new ImageUploadError(
      "Le stockage des photos n’est pas configuré. Contactez l’administrateur.",
    );
  if (file.size > 3 * 1024 * 1024)
    throw new ImageUploadError("La photo doit peser au maximum 3 Mo.");
  const bytes = await normalizeProductImage(
    Buffer.from(await file.arrayBuffer()),
  );
  const name = `${createHash("sha256").update(bytes).digest("hex")}.webp`;
  if (imageStorage(process.env) === "vercel-blob") {
    await put(`products/${name}`, bytes, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/webp",
    });
  } else {
    await mkdir(directory(), { recursive: true });
    await writeFile(path.join(directory(), name), bytes);
  }
  return `/media/products/${name}`;
}
export async function readProductImage(name: string) {
  if (!uploadsEnabled() || !uploadName.test(name)) return null;
  if (imageStorage(process.env) === "vercel-blob") {
    const result = await get(`products/${name}`, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }
  try {
    return await readFile(path.join(directory(), name));
  } catch {
    return null;
  }
}
