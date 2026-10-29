import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin, Leaf } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-xs tracking-wide text-white">
        Une nouvelle boutique se prépare à Dakar.
      </div>
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-6 sm:px-10">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Le Bazar de MSD<span className="text-primary">.</span>
        </Link>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={15} aria-hidden="true" /> Dakar, Sénégal
        </span>
      </header>
      <main id="contenu" className="mx-auto max-w-7xl px-5 pb-12 sm:px-10">
        <section
          className="grid overflow-hidden rounded-2xl bg-secondary md:min-h-[560px] md:grid-cols-2"
          aria-labelledby="hero-title"
        >
          <div className="flex flex-col items-start justify-center px-6 py-12 sm:px-12 lg:py-20">
            <span className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em]">
              <Leaf size={16} aria-hidden="true" /> Utile. Simple. Bien pensé.
            </span>
            <h1
              id="hero-title"
              className="editorial max-w-lg text-4xl leading-[1.12] sm:text-5xl lg:text-6xl"
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
            <span className="mt-9 inline-flex items-center gap-3 rounded-full border border-primary/30 px-5 py-3 text-sm font-semibold">
              Ouverture prochaine <ArrowUpRight size={17} aria-hidden="true" />
            </span>
          </div>
          <div className="relative min-h-80 md:min-h-full">
            <Image
              src="/images/maison.jpg"
              alt="Des rangements muraux noirs organisent les accessoires d’une salle de bain lumineuse."
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
          className="grid gap-6 py-10 sm:grid-cols-3 sm:gap-12"
          aria-label="Nos univers"
        >
          {[
            [
              "01",
              "Une maison organisée",
              "Des accessoires qui trouvent naturellement leur place.",
            ],
            [
              "02",
              "Un quotidien plus pratique",
              "Des idées utiles, faciles à adopter.",
            ],
            [
              "03",
              "Une boutique à Dakar",
              "Une expérience d’achat pensée pour vous.",
            ],
          ].map(([number, title, description]) => (
            <div key={number} className="border-t border-primary/20 pt-5">
              <span className="text-xs text-muted-foreground">{number}</span>
              <h2 className="mt-2 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </section>
        <p className="text-sm text-muted-foreground">
          Aperçu de préparation : les commandes ne sont pas encore ouvertes.
        </p>
      </main>
      <footer className="border-t border-primary/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs text-muted-foreground sm:px-10">
          <span>Le Bazar de MSD · Dakar</span>
          <Link
            href="/connexion"
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Espace équipe
          </Link>
        </div>
      </footer>
    </>
  );
}
