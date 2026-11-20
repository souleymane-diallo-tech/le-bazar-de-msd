import { afterEach, expect, it, vi } from "vitest";
import sharp from "sharp";
const mocks = vi.hoisted(() => ({ put: vi.fn(), get: vi.fn() }));
vi.mock("@vercel/blob", () => mocks);
import { storeProductImage, readProductImage } from "@/modules/catalog/uploads";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
it("écrit et relit uniquement un objet privé normalisé avec la même référence", async () => {
  vi.stubEnv("PRODUCT_IMAGE_STORAGE", "vercel-blob");
  vi.stubEnv("BLOB_STORE_ID", "store_test");
  vi.stubEnv("VERCEL", "1");
  const original = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  const key = await storeProductImage(
    new File([new Uint8Array(original)], "arbitrary.png"),
  );
  const [pathname, bytes, options] = mocks.put.mock.calls[0];
  expect(key).toBe(`/media/${pathname}`);
  expect(options).toMatchObject({
    access: "private",
    addRandomSuffix: false,
    contentType: "image/webp",
  });
  mocks.get.mockResolvedValue({
    statusCode: 200,
    stream: new Response(bytes).body,
  });
  expect(await readProductImage(key.split("/").at(-1)!)).toEqual(bytes);
  expect(mocks.get).toHaveBeenCalledWith(pathname, { access: "private" });
});
it("ne contacte pas le stockage pour un chemin invalide et gère un objet absent", async () => {
  vi.stubEnv("PRODUCT_IMAGE_STORAGE", "vercel-blob");
  vi.stubEnv("BLOB_STORE_ID", "store_test");
  expect(await readProductImage("../secret")).toBeNull();
  expect(mocks.get).not.toHaveBeenCalled();
  mocks.get.mockResolvedValue(null);
  expect(await readProductImage(`${"a".repeat(64)}.webp`)).toBeNull();
});
