export function imageStorage(input: Record<string, string | undefined>) {
  const selected = input.PRODUCT_IMAGE_STORAGE ?? "local";
  if (selected === "vercel-blob") {
    return input.BLOB_READ_WRITE_TOKEN || input.BLOB_STORE_ID
      ? "vercel-blob"
      : "disabled";
  }
  return selected === "local" &&
    !input.VERCEL &&
    ["development", "test"].includes(input.APP_ENV ?? "")
    ? "local"
    : "disabled";
}
