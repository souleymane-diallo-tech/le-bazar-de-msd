import "server-only";
import type { Metadata } from "next";
import { getEnvironment } from "@/lib/env";
import { canonicalUrl, indexingAllowed } from "./rules";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  options: { noindex?: boolean; images?: string[] } = {},
): Metadata {
  const url = canonicalUrl(getEnvironment().APP_URL, path);
  const index = indexingAllowed(process.env) && !options.noindex;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index, follow: index },
    openGraph: {
      type: "website",
      locale: "fr_SN",
      siteName: "Le Bazar de MSD",
      title,
      description,
      url,
      ...(options.images?.length ? { images: options.images } : {}),
    },
    twitter: {
      card: options.images?.length ? "summary_large_image" : "summary",
      title,
      description,
      ...(options.images?.length ? { images: options.images } : {}),
    },
  };
}
