"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { CatalogQuery } from "@/modules/catalog/types";

export function CatalogFilters({
  query,
  categories,
}: {
  query: CatalogQuery;
  categories: { slug: string; name: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const count = Number(Boolean(query.q)) + Number(Boolean(query.category));
  return (
    <form
      action="/catalogue"
      className="my-4 rounded-xl border border-primary/15 bg-white p-3 sm:p-4 md:grid md:grid-cols-[1fr_2fr_auto] md:items-end md:gap-4"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-2 md:grid-cols-1">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="catalog-filters"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex min-h-12 items-center gap-1 rounded-lg border border-primary/30 px-2 text-sm font-semibold md:hidden"
        >
          <SlidersHorizontal size={18} aria-hidden="true" /> Filtres
          {count ? ` (${count})` : ""}
        </button>
        <div className="min-w-0 flex-1">
          <label htmlFor="sort" className="mb-1 block text-xs font-semibold">
            Trier par
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={query.sort}
            className="min-h-12 w-full rounded-lg border border-primary/30 bg-white px-2 text-base"
          >
            <option value="recent">Nouveautés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
      </div>
      <div
        id="catalog-filters"
        className={`${expanded ? "grid" : "hidden"} mt-3 gap-3 border-t border-primary/10 pt-3 md:mt-0 md:grid md:grid-cols-2 md:border-0 md:pt-0`}
      >
        <div className="min-w-0">
          <label htmlFor="q" className="mb-1 block text-sm font-semibold">
            Rechercher un produit
          </label>
          <input
            id="q"
            name="q"
            type="search"
            maxLength={100}
            defaultValue={query.q}
            placeholder="Savon, rangement, horloge…"
            enterKeyHint="search"
            className="min-h-12 w-full rounded-lg border border-primary/30 px-3 text-base"
          />
        </div>
        <div className="min-w-0">
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-semibold"
          >
            Catégorie
          </label>
          <select
            id="category"
            name="category"
            defaultValue={query.category}
            className="min-h-12 w-full rounded-lg border border-primary/30 bg-white px-3 text-base"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground md:hidden">
          Choisissez vos critères, puis appuyez sur « Afficher ».
        </p>
      </div>
      <button
        type="submit"
        className="mt-3 min-h-12 w-full rounded-lg bg-primary px-3 text-sm font-bold text-white hover:bg-primary/90 md:mt-0 md:w-auto md:px-5"
      >
        Afficher
      </button>
    </form>
  );
}
