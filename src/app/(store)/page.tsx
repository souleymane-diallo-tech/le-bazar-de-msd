import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  House,
  Bath,
  Zap,
  MessageCircle,
  PackageCheck,
} from "lucide-react";
import { getCatalog } from "@/modules/catalog/service";
import { ProductCard } from "@/components/store/product-card";
import { pageMetadata } from "@/modules/seo/metadata";
export const dynamic = "force-dynamic";
export function generateMetadata() {
  return pageMetadata(
    "Les essentiels du quotidien",
    "Des idées utiles pour organiser et embellir le quotidien. Découvrez la collection du Bazar de MSD à Dakar.",
    "/",
  );
}
const universes = [
  { name: "Maison", slug: "maison", icon: House },
  { name: "Salle de bain", slug: "salle-de-bain", icon: Bath },
  { name: "Gadgets", slug: "gadgets", icon: Zap },
];
export default async function HomePage() {
  const products = await getCatalog();
  return (
    <main id="contenu" className="mx-auto max-w-7xl px-4 pb-8 sm:px-8">
      <section
        aria-labelledby="hero-title"
        className="relative mt-4 grid grid-cols-[1.55fr_1fr] overflow-hidden rounded-2xl bg-secondary md:min-h-80 md:grid-cols-2"
      >
        <div className="relative z-10 flex flex-col items-start justify-center p-4 sm:p-8 lg:p-12">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-primary sm:text-xs">
            Des idées utiles, tout simplement
          </p>
          <h1
            id="hero-title"
            className="text-xl font-bold leading-tight tracking-tight min-[375px]:text-2xl sm:text-4xl lg:text-5xl"
          >
            Un quotidien
            <br />
            plus pratique.
          </h1>
          <p className="mt-3 hidden max-w-sm text-muted-foreground md:block">
            Pour votre maison, vos petits espaces et vos envies de simplicité.
          </p>
          <Link
            href="/catalogue"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary/90 sm:mt-5 sm:px-5"
          >
            Découvrir <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="relative min-w-0">
          <Image
            src="/images/maison.jpg"
            alt="Rangements muraux pour organiser la salle de bain"
            fill
            sizes="(max-width: 767px) 38vw, 50vw"
            priority
            className="object-cover object-center"
          />
        </div>
      </section>
      <nav
        aria-label="Nos univers"
        className="my-4 grid grid-cols-3 gap-2 sm:my-6 sm:gap-4"
      >
        {universes.map(({ name, slug, icon: Icon }) => (
          <Link
            key={slug}
            href={`/catalogue?category=${slug}`}
            className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-primary/15 bg-white px-1 py-2 text-center text-xs font-semibold transition-colors hover:bg-secondary sm:min-h-20 sm:flex-row sm:gap-3 sm:text-base"
          >
            <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
            {name}
          </Link>
        ))}
      </nav>
      <section aria-labelledby="selection-title" className="py-1 sm:py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2
              id="selection-title"
              className="text-xl font-bold tracking-tight sm:text-3xl"
            >
              À découvrir
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Une sélection pour votre quotidien
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary underline underline-offset-4"
          >
            Tout voir <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-secondary p-6">
            La collection arrive bientôt. Aucun produit n’est encore publié.
          </p>
        )}
        {products.some((p) => p.isDemo) && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Prix et stocks de démonstration. Aucune vente réelle.
          </p>
        )}
      </section>
      <section
        aria-labelledby="how-title"
        className="mt-7 rounded-2xl border border-primary/15 bg-white p-5 sm:mt-10 sm:p-8"
      >
        <h2 id="how-title" className="text-lg font-bold sm:text-2xl">
          Votre commande, en toute simplicité
        </h2>
        <ol className="mt-5 grid gap-5 text-sm sm:grid-cols-3">
          {[
            [
              "1",
              "Choisissez vos articles",
              "Parcourez les produits et ajoutez vos envies au panier.",
            ],
            [
              "2",
              "Vérifiez votre commande",
              "Retrouvez le total et les frais avant de confirmer.",
            ],
            [
              "3",
              "La boutique prend le relais",
              "Le gérant reçoit la commande pour en assurer le suivi.",
            ],
          ].map(([n, title, description]) => (
            <li key={n} className="flex gap-3">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-primary"
                aria-hidden="true"
              >
                {n}
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t border-primary/10 pt-4 text-xs text-muted-foreground">
          Vous testez une démonstration : paiement et livraison sont simulés.
        </p>
      </section>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Link
          href="/contact"
          className="flex min-h-14 items-center gap-2 rounded-xl px-3 py-3 font-semibold hover:bg-secondary"
        >
          <MessageCircle size={20} aria-hidden="true" />
          Besoin d’aide ?{" "}
          <ArrowRight
            size={16}
            className="ml-auto shrink-0"
            aria-hidden="true"
          />
        </Link>
        <Link
          href="/demonstration"
          className="flex min-h-14 items-center gap-2 rounded-xl px-3 py-3 font-semibold hover:bg-secondary"
        >
          <PackageCheck size={20} className="shrink-0" aria-hidden="true" />
          Comment tester{" "}
          <ArrowRight
            size={16}
            className="ml-auto shrink-0"
            aria-hidden="true"
          />
        </Link>
      </div>
    </main>
  );
}
