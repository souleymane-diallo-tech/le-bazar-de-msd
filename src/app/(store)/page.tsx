import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf } from "lucide-react";
import { getCatalog } from "@/modules/catalog/service";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getCatalog();
  return (
    <main id="contenu" className="mx-auto max-w-7xl px-5 pb-8 sm:px-10">
      <section
        className="mt-4 grid overflow-hidden rounded-2xl bg-secondary md:min-h-[530px] md:grid-cols-2"
        aria-labelledby="hero-title"
      >
        <div className="flex flex-col items-start justify-center px-6 py-12 sm:px-12">
          <span className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em]">
            <Leaf size={16} aria-hidden="true" /> Utile. Simple. Bien pensé.
          </span>
          <h1
            id="hero-title"
            className="editorial text-4xl leading-[1.12] sm:text-5xl lg:text-6xl"
          >
            Les petits détails.
            <br />
            <span className="italic">Le plaisir</span>
            <br />
            du quotidien.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
            Des objets pratiques pour la maison et des idées qui vous
            simplifient la vie.
          </p>
          <Button asChild className="mt-8">
            <Link href="/catalogue">
              Explorer la collection <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="relative min-h-80 md:min-h-full">
          <Image
            src="/images/maison.jpg"
            alt="Rangements muraux noirs dans une salle de bain lumineuse."
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            priority
            className="object-cover"
          />
          <span className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold">
            La maison, en toute simplicité.
          </span>
        </div>
      </section>
      <section
        aria-label="Nos univers"
        className="grid gap-4 py-8 sm:grid-cols-3"
      >
        {[
          [
            "01",
            "Maison & décoration",
            "maison",
            "Un intérieur qui vous ressemble.",
          ],
          [
            "02",
            "Salle de bain",
            "salle-de-bain",
            "Chaque essentiel à sa place.",
          ],
          [
            "03",
            "Gadgets du quotidien",
            "gadgets",
            "Pratiques, où que vous soyez.",
          ],
        ].map(([n, title, slug, description]) => (
          <Link
            key={slug}
            href={`/catalogue?category=${slug}`}
            className="group rounded-xl border border-primary/15 p-5 transition-colors hover:bg-secondary"
          >
            <span className="text-xs text-muted-foreground">{n}</span>
            <div className="mt-2 flex items-center justify-between gap-2">
              <h2 className="font-semibold">{title}</h2>
              <ArrowRight size={17} aria-hidden="true" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </section>
      <section aria-labelledby="selection-title" className="py-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.18em] text-muted-foreground">
              À découvrir
            </p>
            <h2
              id="selection-title"
              className="editorial mt-2 text-3xl sm:text-4xl"
            >
              Les nouveautés
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4"
          >
            Tout voir <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {products.some((p) => p.isDemo) && (
          <p className="mb-6 text-sm text-muted-foreground">
            Sélection de démonstration — prix et stocks fictifs, aucune vente
            réelle.
          </p>
        )}
        {products.length ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-secondary p-8">
            La collection arrive bientôt. Aucun produit n’est encore publié.
          </p>
        )}
      </section>
      <section className="mt-12 grid gap-6 rounded-2xl bg-primary p-7 text-white sm:grid-cols-[1.5fr_1fr] sm:p-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/80">
            Pensé pour votre quotidien
          </p>
          <h2 className="editorial mt-3 text-3xl">
            Une boutique à taille humaine.
          </h2>
        </div>
        <p className="self-center text-sm leading-relaxed text-white/85">
          Notre collection se prépare à Dakar. Les modalités de livraison et les
          moyens de paiement seront précisés avant l’ouverture des commandes.
        </p>
      </section>
    </main>
  );
}
