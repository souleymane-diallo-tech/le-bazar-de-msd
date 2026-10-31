import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import { CartLink } from "@/components/store/cart-link";
import { getOrderPolicy } from "@/modules/orders/runtime";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-xs leading-relaxed text-white">
        {getOrderPolicy().enabled
          ? "Démonstration · Commandes fictives, aucune vente réelle"
          : "Version découverte · Commandes et paiements désactivés"}
      </div>
      <header className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 py-5">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Le Bazar de MSD.
          </Link>
          <CartLink />
        </div>
        <nav
          aria-label="Navigation principale"
          className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-primary/15 py-2 text-sm"
        >
          <Link className="inline-flex min-h-11 items-center" href="/catalogue">
            Toute la collection
          </Link>
          <Link
            className="inline-flex min-h-11 items-center"
            href="/catalogue?category=maison"
          >
            Maison
          </Link>
          <Link
            className="inline-flex min-h-11 items-center"
            href="/catalogue?category=salle-de-bain"
          >
            Salle de bain
          </Link>
          <Link
            className="inline-flex min-h-11 items-center"
            href="/catalogue?category=gadgets"
          >
            Gadgets
          </Link>
          <span className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <MapPin size={14} aria-hidden="true" /> Dakar, Sénégal
          </span>
        </nav>
      </header>
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
