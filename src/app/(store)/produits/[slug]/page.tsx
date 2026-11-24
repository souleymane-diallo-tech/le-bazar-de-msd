import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog, getProduct } from "@/modules/catalog/service";
import { getEnvironment } from "@/lib/env";
import { getPublicSettings } from "@/modules/settings/read";
import { pageMetadata } from "@/modules/seo/metadata";
import {
  canonicalUrl,
  indexingAllowed,
  productStructuredData,
  serializeJsonLd,
} from "@/modules/seo/rules";
import { ProductDetails } from "@/components/store/product-details";
import { ProductCard } from "@/components/store/product-card";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product
    ? pageMetadata(
        product.name,
        product.description,
        `/produits/${encodeURIComponent(product.slug)}`,
        {
          images: product.images.map((image) => image.src),
          noindex: product.isDemo,
        },
      )
    : { title: "Produit introuvable" };
}
export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { retour } = await searchParams;
  const returnTo =
    typeof retour === "string" && /^\/catalogue(?:\?|$)/.test(retour)
      ? retour
      : "/catalogue";
  const { slug } = await params;
  const [product, products, settings] = await Promise.all([
    getProduct(slug),
    getCatalog(),
    getPublicSettings(),
  ]);
  if (!product) notFound();
  const whatsapp = settings.whatsapp || null;
  const productUrl = canonicalUrl(
    getEnvironment().APP_URL,
    `/produits/${encodeURIComponent(product.slug)}`,
  );
  const structuredData = productStructuredData(
    product,
    getEnvironment().APP_URL,
    indexingAllowed(process.env),
  );
  const related = products
    .filter((p) => p.id !== product.id)
    .sort(
      (a, b) =>
        Number(b.category.slug === product.category.slug) -
        Number(a.category.slug === product.category.slug),
    )
    .slice(0, 3);
  return (
    <main
      id="contenu"
      className="product-page mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-8"
    >
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
        />
      )}
      <nav
        aria-label="Fil d’Ariane"
        className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground"
      >
        <Link href="/" className="inline-flex min-h-11 items-center underline">
          Accueil
        </Link>
        <span className="self-center">/</span>
        <Link
          href={returnTo}
          className="inline-flex min-h-11 items-center underline"
        >
          Retour à la collection
        </Link>
        <span className="self-center">/</span>
        <span className="self-center">{product.name}</span>
      </nav>
      <ProductDetails
        key={product.id}
        product={product}
        whatsapp={whatsapp}
        productUrl={productUrl}
      />
      {related.length > 0 && (
        <section
          className="mt-8 border-t border-primary/15 pt-6"
          aria-labelledby="related-title"
        >
          <h2 id="related-title" className="mb-4 text-xl font-bold sm:text-2xl">
            À découvrir aussi
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
