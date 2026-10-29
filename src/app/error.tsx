"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="contenu" className="mx-auto max-w-lg px-5 py-20">
      <h1 className="editorial text-3xl">
        Ce service est momentanément indisponible.
      </h1>
      <p className="my-6 text-muted-foreground">
        Veuillez réessayer dans quelques instants.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </main>
  );
}
