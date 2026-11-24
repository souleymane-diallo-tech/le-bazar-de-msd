import Link from "next/link";
import { X } from "lucide-react";
import { getCatalog } from "@/modules/catalog/service";
import { parseCatalogQuery, selectCatalog } from "@/modules/catalog/rules";
import { ProductCard } from "@/components/store/product-card";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { pageMetadata } from "@/modules/seo/metadata";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return pageMetadata(
    "La collection",
    "Objets utiles pour la maison, la salle de bain et le quotidien. Parcourez la collection du Bazar de MSD.",
    "/catalogue",
    { noindex: Object.keys(await searchParams).length > 0 },
  );
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseCatalogQuery(await searchParams);
  const products = await getCatalog();
  const categories = [
    ...new Map(products.map((p) => [p.category.slug, p.category])).values(),
  ];
  const result = selectCatalog(products, query);
  const pageHref = (page: number) =>
    `/catalogue?${new URLSearchParams({ ...query, page: String(page) })}`;
  const filterHref = (changes: Partial<typeof query>) =>
    `/catalogue?${new URLSearchParams({ ...query, ...changes, page: "1" })}`;
  return (
    <main
      id="contenu"
      className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-8 sm:pt-8"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
          La collection
        </h1>
        <p
          className="shrink-0 text-sm text-muted-foreground"
          aria-live="polite"
        >
          {result.total} produit{result.total > 1 ? "s" : ""}
        </p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Des objets utiles, à portée de main.
      </p>
      <CatalogFilters
        key={JSON.stringify(query)}
        query={query}
        categories={categories}
      />
      {(query.q || query.category) && (
        <div aria-label="Filtres actifs" className="mb-3 flex flex-wrap gap-2">
          {query.q && (
            <Link
              aria-label="Retirer la recherche"
              href={filterHref({ q: "" })}
              className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
            >
              <span className="min-w-0 break-words">Recherche : {query.q}</span>
              <X size={16} className="shrink-0" aria-hidden="true" />
            </Link>
          )}
          {query.category && (
            <Link
              aria-label="Retirer la catégorie"
              href={filterHref({ category: "" })}
              className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
            >
              <span className="min-w-0 break-words">
                {categories.find((c) => c.slug === query.category)?.name ??
                  query.category}
              </span>
              <X size={16} className="shrink-0" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {products.some((p) => p.isDemo)
            ? "Prix et stocks fictifs · Aucune vente réelle."
            : "Découvrez les articles disponibles."}
        </p>
        {(query.q || query.category) && (
          <Link
            href="/catalogue"
            className="inline-flex min-h-11 items-center text-sm underline"
          >
            Effacer les filtres
          </Link>
        )}
      </div>
      {result.items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <h2 className="text-xl font-semibold">Aucun produit trouvé</h2>
          <p className="mx-auto mt-3 max-w-sm px-4 text-muted-foreground">
            Essayez un autre mot-clé ou consultez toute la collection.
          </p>
          <Link
            href="/catalogue"
            className="mt-5 inline-flex min-h-11 items-center underline"
          >
            Voir toute la collection
          </Link>
        </div>
      )}
      {result.pages > 1 && (
        <nav
          aria-label="Pagination du catalogue"
          className="mt-12 flex items-center justify-center gap-6"
        >
          {result.page > 1 && (
            <Link
              className="inline-flex min-h-11 items-center underline"
              href={pageHref(result.page - 1)}
            >
              Précédente
            </Link>
          )}
          <span>
            Page {result.page} sur {result.pages}
          </span>
          {result.page < result.pages && (
            <Link
              className="inline-flex min-h-11 items-center underline"
              href={pageHref(result.page + 1)}
            >
              Suivante
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
