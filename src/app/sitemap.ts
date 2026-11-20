import type { MetadataRoute } from "next";
import { getEnvironment } from "@/lib/env";
import { getCatalog } from "@/modules/catalog/service";
import {
  canonicalUrl,
  indexingAllowed,
  sitemapPaths,
} from "@/modules/seo/rules";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingAllowed(process.env)) return [];
  const origin = getEnvironment().APP_URL;
  return sitemapPaths(await getCatalog(), true).map((path) => ({
    url: canonicalUrl(origin, path),
  }));
}
