import Link from "next/link";
export default function ProductNotFound() {
  return (
    <main id="contenu" className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Cet article n’est plus disponible.</h1>
      <p className="mt-3 text-muted-foreground">
        Il a peut-être été retiré de la collection. Retrouvez les articles
        actuellement proposés.
      </p>
      <Link
        href="/catalogue"
        className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-primary px-5 font-semibold text-white"
      >
        Voir la collection
      </Link>
    </main>
  );
}
