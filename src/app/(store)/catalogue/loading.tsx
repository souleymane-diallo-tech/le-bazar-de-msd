export default function CatalogLoading() {
  return (
    <main
      id="contenu"
      className="mx-auto min-h-96 max-w-7xl px-5 py-16 sm:px-10"
    >
      <p role="status" className="text-muted-foreground">
        Chargement de la collection…
      </p>
      <div
        aria-hidden="true"
        className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="aspect-square rounded-xl bg-secondary" />
        ))}
      </div>
    </main>
  );
}
