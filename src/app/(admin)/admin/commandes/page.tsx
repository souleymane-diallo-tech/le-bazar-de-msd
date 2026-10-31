import Link from "next/link";
import { getDb } from "@/lib/db";
import { requirePermission } from "@/modules/identity/session";
import { stateLabels, orderStates } from "@/modules/orders/rules";
import { formatPrice } from "@/modules/catalog/rules";
import { AdminForm } from "@/components/admin/form";
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  await requirePermission("orders:manage");
  const params = await searchParams;
  const page = Math.max(1, Math.min(10000, Number(params.page) || 1));
  const status = orderStates.find((s) => s === params.status);
  const q = (params.q ?? "").slice(0, 100);
  const where = {
    isDemo: true,
    ...(status ? { status } : {}),
    ...(q ? { reference: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [orders, count] = await Promise.all([
    getDb().order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (Math.floor(page) - 1) * 20,
      take: 20,
      include: { payments: true },
    }),
    getDb().order.count({ where }),
  ]);
  return (
    <>
      <h1 className="editorial text-4xl">Commandes de test</h1>
      <div className="my-6 rounded-xl bg-secondary p-5">
        <p className="mb-4 text-sm">
          Les commandes à confirmer expirent après 24 h. Les réservations échues
          sont libérées au prochain devis ou avec ce bouton, par lots de 100.
          Aucun traitement planifié hors trafic.
        </p>
        <AdminForm action="expire" submit="Libérer les réservations expirées" />
      </div>
      <form className="my-6 flex flex-wrap gap-3">
        <label>
          Référence
          <input
            name="q"
            defaultValue={q}
            className="ml-2 min-h-11 rounded-lg border p-2"
          />
        </label>
        <label>
          État
          <select
            name="status"
            defaultValue={status ?? ""}
            className="ml-2 min-h-11 rounded-lg border p-2"
          >
            <option value="">Tous</option>
            {orderStates.map((s) => (
              <option key={s} value={s}>
                {stateLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <button className="min-h-11 rounded-lg bg-primary px-4 text-white">
          Filtrer
        </button>
      </form>
      <p className="mb-4 text-sm">{count} commande(s)</p>
      <div className="space-y-4">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/admin/commandes/${o.id}`}
            className="block rounded-xl border border-border bg-white p-5 hover:border-primary"
          >
            <span className="break-all text-sm font-semibold">
              {o.reference}
            </span>
            <div className="mt-3 flex flex-wrap justify-between gap-3">
              <span>{stateLabels[o.status]}</span>
              <span>{formatPrice(o.totalXof)}</span>
              <span className="text-sm">
                {o.createdAt.toLocaleString("fr-FR", { timeZone: "UTC" })} UTC
              </span>
            </div>
            <p className="mt-3 text-xs">
              {o.payments.some((p) => p.status === "SUCCEEDED")
                ? "Collecte simulée enregistrée"
                : "Encaissement à vérifier"}
            </p>
          </Link>
        ))}
      </div>
      <nav aria-label="Pagination commandes" className="mt-6 flex gap-5">
        {page > 1 && (
          <Link
            href={`?${new URLSearchParams({ page: String(page - 1), status: status ?? "", q })}`}
            className="min-h-11 underline"
          >
            Précédent
          </Link>
        )}
        {page * 20 < count && (
          <Link
            href={`?${new URLSearchParams({ page: String(page + 1), status: status ?? "", q })}`}
            className="min-h-11 underline"
          >
            Suivant
          </Link>
        )}
      </nav>
    </>
  );
}
