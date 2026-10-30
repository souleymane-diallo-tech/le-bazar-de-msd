import Link from "next/link";
import { Search } from "lucide-react";
import { getCatalog } from "@/modules/catalog/service";
import { parseCatalogQuery, selectCatalog } from "@/modules/catalog/rules";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
export const dynamic = "force-dynamic";
export const metadata = { title: "La collection" };

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
  return (
    <main id="contenu" className="mx-auto max-w-7xl px-5 pb-10 pt-9 sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
        Les essentiels du quotidien
      </p>
      <h1 className="editorial mt-3 text-4xl sm:text-5xl">La collection</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Pour organiser, simplifier et embellir les petits moments de la vie.
      </p>
      {products.some((p) => p.isDemo) && (
        <p className="mt-5 rounded-lg bg-secondary px-4 py-3 text-sm">
          Catalogue de démonstration : prix, variantes et stocks fictifs. Aucune
          vente réelle.
        </p>
      )}
      <form
        action="/catalogue"
        className="my-8 grid items-end gap-4 rounded-xl border border-primary/15 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="q">
            Rechercher un produit
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-3.5 text-muted-foreground"
              size={18}
              aria-hidden="true"
            />
            <input
              key={query.q}
              defaultValue={query.q}
              id="q"
              name="q"
              maxLength={100}
              type="search"
              placeholder="Savon, rangement, horloge…"
              className="min-h-12 w-full rounded-lg border border-border py-2 pl-10 pr-3"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-semibold"
          >
            Catégorie
          </label>
          <select
            key={query.category}
            name="category"
            id="category"
            defaultValue={query.category}
            className="min-h-12 w-full rounded-lg border border-border px-3"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="mb-2 block text-sm font-semibold">
            Trier par
          </label>
          <select
            key={query.sort}
            id="sort"
            name="sort"
            defaultValue={query.sort}
            className="min-h-12 w-full rounded-lg border border-border px-3"
          >
            <option value="recent">Nouveautés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
        <Button type="submit">Afficher</Button>
      </form>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {result.total} produit{result.total > 1 ? "s" : ""}
          {query.q ? ` pour « ${query.q} »` : ""}
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
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} />
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
