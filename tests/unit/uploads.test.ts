import { expect, it } from "vitest";
import sharp from "sharp";
import { normalizeProductImage, uploadName } from "@/modules/catalog/uploads";
import { safeImage } from "@/modules/catalog/repository";
it("normalise une image et limite les dimensions sans conserver les métadonnées", async () => {
  const input = await sharp({
    create: { width: 1800, height: 900, channels: 3, background: "white" },
  })
    .jpeg()
    .toBuffer();
  const output = await normalizeProductImage(input);
  const metadata = await sharp(output).metadata();
  expect(metadata).toMatchObject({ format: "webp", width: 1600, height: 800 });
  expect(metadata.exif).toBeUndefined();
});
it("refuse faux fichiers, SVG, fichiers vides et trop volumineux", async () => {
  for (const bytes of [
    Buffer.alloc(0),
    Buffer.alloc(3 * 1024 * 1024 + 1),
    Buffer.from("not an image"),
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>',
    ),
  ])
    await expect(normalizeProductImage(bytes)).rejects.toThrow();
});
it("refuse les chemins arbitraires et URL externes", () => {
  expect(safeImage(`/media/products/${"a".repeat(64)}.webp`)).toBeTruthy();
  for (const name of ["../.env", "foo.svg", "../photo.webp"])
    expect(uploadName.test(name)).toBe(false);
  expect(safeImage("https://example.com/photo.webp")).toBeNull();
});
