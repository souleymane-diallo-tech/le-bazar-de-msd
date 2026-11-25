import Link from "next/link";
import { MapPin, ArrowUpRight, Search } from "lucide-react";
import { CartLink } from "@/components/store/cart-link";
import { StoreExperience } from "@/components/store/store-experience";
import { getOrderPolicy } from "@/modules/orders/runtime";
import { getPublicSettings } from "@/modules/settings/read";
export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();
  const socials = [
    ["Facebook", settings.facebook],
    ["Instagram", settings.instagram],
    ["TikTok", settings.tiktok],
  ].filter(([, url]) => url);
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-xs leading-relaxed text-white">
        {getOrderPolicy().enabled
          ? "Démonstration · Commandes fictives, aucune vente réelle"
          : "Version découverte · Commandes et paiements désactivés"}
      </div>
      <header className="sticky top-0 z-30 border-b border-primary/15 bg-background shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex items-center justify-between gap-3 py-2 sm:gap-6 sm:py-3">
            <Link
              href="/"
              className="inline-flex min-h-11 shrink-0 items-center text-base font-extrabold tracking-tight sm:text-xl"
              aria-label="Le Bazar de MSD, accueil"
            >
              Le Bazar de MSD<span className="text-primary">.</span>
            </Link>
            <form
              action="/catalogue"
              role="search"
              aria-label="Recherche dans la boutique"
              className="hidden min-w-0 flex-1 md:flex"
            >
              <label htmlFor="desktop-search" className="sr-only">
                Chercher dans la boutique
              </label>
              <input
                id="desktop-search"
                name="q"
                type="search"
                maxLength={100}
                placeholder="Rechercher un produit…"
                className="min-h-11 w-full min-w-0 rounded-l-lg border border-primary/30 bg-white px-4 text-base"
              />
              <button
                type="submit"
                aria-label="Lancer la recherche"
                className="flex min-h-11 min-w-12 items-center justify-center rounded-r-lg bg-primary text-white hover:bg-primary/90"
              >
                <Search size={21} aria-hidden="true" />
              </button>
            </form>
            <CartLink />
          </div>
          <form
            action="/catalogue"
            role="search"
            aria-label="Recherche dans la boutique"
            className="mb-2 flex md:hidden"
          >
            <label htmlFor="mobile-search" className="sr-only">
              Chercher dans la boutique
            </label>
            <input
              id="mobile-search"
              name="q"
              type="search"
              maxLength={100}
              enterKeyHint="search"
              placeholder="Rechercher un produit…"
              className="min-h-11 w-full min-w-0 rounded-l-lg border border-primary/30 bg-white px-3 text-base"
            />
            <button
              type="submit"
              aria-label="Lancer la recherche"
              className="flex min-h-11 min-w-12 items-center justify-center rounded-r-lg bg-primary text-white hover:bg-primary/90"
            >
              <Search size={21} aria-hidden="true" />
            </button>
          </form>
          <nav
            aria-label="Navigation principale"
            className="flex items-center gap-3 overflow-x-auto text-sm sm:gap-6"
          >
            {[
              ["Tout voir", "/catalogue"],
              ["Maison", "/catalogue?category=maison"],
              ["Salle de bain", "/catalogue?category=salle-de-bain"],
              ["Gadgets", "/catalogue?category=gadgets"],
            ].map(([name, href]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap font-medium hover:underline underline-offset-4"
              >
                {name}
              </Link>
            ))}
            <span className="ml-auto hidden shrink-0 items-center gap-1 text-xs text-muted-foreground lg:flex">
              <MapPin size={14} aria-hidden="true" />
              Dakar, Sénégal
            </span>
          </nav>
        </div>
      </header>
      <StoreExperience />
      {children}
      <footer className="mt-12 border-t border-primary/20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-10">
          <div>
            <Link href="/" className="text-lg font-bold">
              Le Bazar de MSD.
            </Link>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Des idées utiles, une maison bien pensée.
              <br />
              Une boutique en préparation à Dakar.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-7 sm:justify-end">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            >
              Contact
            </Link>
            <Link
              href="/demonstration"
              className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            >
              À propos de la démo
            </Link>
            {socials.map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
              >
                {name}
              </a>
            ))}
            <Link
              href="/catalogue"
              className="inline-flex min-h-11 items-center gap-1 text-sm underline underline-offset-4"
            >
              Découvrir la collection{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <Link
              href="/connexion"
              className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            >
              Espace équipe
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
