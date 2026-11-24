export default function CatalogLoading() {
  return (
    <main id="contenu" className="mx-auto min-h-96 max-w-7xl px-4 py-8 sm:px-8">
      <p role="status" className="text-muted-foreground">
        Chargement de la collection…
      </p>
      <div
        aria-hidden="true"
        className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      >
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="aspect-square rounded-xl bg-secondary" />
        ))}
      </div>
    </main>
  );
}
