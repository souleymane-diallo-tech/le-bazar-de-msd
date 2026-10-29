import Link from "next/link";
export default function NotFound() {
  return (
    <main id="contenu" className="mx-auto max-w-lg px-5 py-20">
      <h1 className="editorial text-3xl">Cette page n’existe pas.</h1>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-12 items-center underline"
      >
        Retour à l’accueil
      </Link>
    </main>
  );
}
