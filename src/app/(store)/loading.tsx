export default function StoreLoading() {
  return (
    <main
      id="contenu"
      aria-busy="true"
      className="mx-auto min-h-96 max-w-7xl px-4 py-8 sm:px-8"
    >
      <p role="status" className="font-semibold">
        Chargement de la page…
      </p>
      <div aria-hidden="true" className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="h-64 rounded-2xl bg-secondary motion-safe:animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded-lg bg-secondary" />
          <div className="h-24 rounded-xl bg-secondary" />
          <div className="h-12 rounded-lg bg-secondary" />
        </div>
      </div>
    </main>
  );
}
