import type { MetadataRoute } from "next";
import { indexingAllowed, canonicalUrl } from "@/modules/seo/rules";
import { getEnvironment } from "@/lib/env";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  if (!indexingAllowed(process.env))
    return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/connexion",
        "/commande",
        "/panier",
        "/demonstration",
        "/catalogue?",
      ],
    },
    sitemap: canonicalUrl(getEnvironment().APP_URL, "/sitemap.xml"),
  };
}
