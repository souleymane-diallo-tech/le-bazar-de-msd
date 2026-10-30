import "server-only";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { getEnvironment } from "@/lib/env";
import { readPublicCatalog } from "./repository";

export const getCatalog = cache(async () =>
  readPublicCatalog(getDb(), getEnvironment().APP_ENV !== "production"),
);
export async function getProduct(slug: string) {
  return (await getCatalog()).find((p) => p.slug === slug) ?? null;
}
