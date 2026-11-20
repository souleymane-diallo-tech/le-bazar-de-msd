import { expect, it } from "vitest";
import { imageStorage } from "@/modules/catalog/storage-policy";
it("ne permet jamais un stockage disque éphémère sur Vercel", () => {
  expect(imageStorage({ APP_ENV: "development" })).toBe("local");
  expect(imageStorage({ APP_ENV: "development", VERCEL: "1" })).toBe(
    "disabled",
  );
  expect(imageStorage({ APP_ENV: "demo" })).toBe("disabled");
});
it("requiert un stockage distant explicitement activé et connecté", () => {
  expect(imageStorage({ PRODUCT_IMAGE_STORAGE: "vercel-blob" })).toBe(
    "disabled",
  );
  expect(
    imageStorage({
      PRODUCT_IMAGE_STORAGE: "vercel-blob",
      BLOB_STORE_ID: "store_test",
    }),
  ).toBe("vercel-blob");
  expect(
    imageStorage({
      PRODUCT_IMAGE_STORAGE: "vercel-blob",
      BLOB_READ_WRITE_TOKEN: "test-only",
    }),
  ).toBe("vercel-blob");
  expect(
    imageStorage({
      PRODUCT_IMAGE_STORAGE: "disabled",
      BLOB_STORE_ID: "store_test",
    }),
  ).toBe("disabled");
});
