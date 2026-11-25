"use client";
import Link from "next/link";
import { useTransition } from "react";

export default function StoreError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <main id="contenu" className="mx-auto max-w-2xl px-4 py-10">
      <section className="rounded-2xl border border-primary/15 bg-white p-6">
        <h1 className="text-2xl font-bold">
          Cette page n’a pas pu s’afficher.
        </h1>
        <p role="alert" className="mt-3 text-sm">
          Réessayez dans un instant. Si vous veniez de confirmer une commande,
          utilisez sa récupération pour vérifier son enregistrement.
        </p>
        <button
          className="mt-5 min-h-12 rounded-lg bg-primary px-5 font-semibold text-white disabled:opacity-60"
          disabled={pending}
          onClick={() => startTransition(retry)}
        >
          {pending ? "Nouvelle tentative…" : "Réessayer"}
        </button>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            href="/catalogue"
            className="inline-flex min-h-11 items-center underline"
          >
            Retour au catalogue
          </Link>
          <Link
            href="/commande"
            className="inline-flex min-h-11 items-center underline"
          >
            Retrouver ma commande
          </Link>
        </div>
      </section>
    </main>
  );
}
