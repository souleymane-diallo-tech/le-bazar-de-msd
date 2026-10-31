import { redirect } from "next/navigation";
import { getActor } from "@/modules/identity/session";
import { SignOut } from "./sign-out";
import { getDb } from "@/lib/db";
import { formatPrice } from "@/modules/catalog/rules";
import Link from "next/link";

export default async function AdminPage() {
  const actor = await getActor();
  if (!actor) redirect("/connexion");
  const db = getDb();
  const [pending, delivered, collected, refunded, customers, audit] =
    await Promise.all([
      db.order.count({
        where: { isDemo: true, status: "PENDING_CONFIRMATION" },
      }),
      db.order.count({ where: { isDemo: true, status: "DELIVERED" } }),
      db.payment.aggregate({
        where: {
          order: { isDemo: true },
          status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED", "REFUNDED"] },
        },
        _sum: { amountXof: true },
      }),
      db.refund.aggregate({
        where: { payment: { order: { isDemo: true } }, status: "SUCCEEDED" },
        _sum: { amountXof: true },
      }),
      db.customer.findMany({
        where: { orders: { some: { isDemo: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { _count: { select: { orders: true } } },
      }),
      actor.roleId === "OWNER"
        ? db.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
              id: true,
              action: true,
              targetType: true,
              createdAt: true,
            },
          })
        : [],
    ]);
  return (
    <section className="mx-auto max-w-5xl py-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-sm text-muted-foreground">
            Le Bazar de MSD · Espace équipe
          </p>
          <h1 className="editorial mt-3 text-4xl">Bienvenue, {actor.name}</h1>
        </div>
        <SignOut />
      </div>
      <div className="mt-10 rounded-xl border border-border bg-white p-6">
        <h2 className="text-lg font-semibold">Pilotage de la démonstration</h2>
        <p className="mt-3 text-muted-foreground">
          Les indicateurs ci-dessous concernent uniquement les commandes
          fictives.
        </p>
        <p className="mt-5 text-sm">
          Rôle : {actor.roleId === "OWNER" ? "Propriétaire" : "Gestionnaire"}
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["À confirmer", String(pending)],
          ["Livrées", String(delivered)],
          [
            "Collecte nette simulée",
            formatPrice(
              (collected._sum.amountXof ?? 0) - (refunded._sum.amountXof ?? 0),
            ),
          ],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-secondary p-5">
            <p className="text-sm">{label}</p>
            <strong className="mt-3 block text-2xl">{value}</strong>
          </div>
        ))}
      </div>
      <Link
        href="/admin/commandes"
        className="mt-6 inline-flex min-h-11 items-center underline"
      >
        Traiter les commandes →
      </Link>
      <section className="mt-8">
        <h2 className="editorial text-2xl">Derniers clients fictifs</h2>
        <p className="my-3 text-xs">
          20 plus récents. Aucun regroupement automatique par téléphone.
        </p>
        <ul className="divide-y divide-border">
          {customers.map((c) => (
            <li key={c.id} className="py-3 text-sm">
              {c.name} · {c.phoneNormalized} · {c._count.orders} commande(s)
            </li>
          ))}
        </ul>
      </section>
      {actor.roleId === "OWNER" && (
        <section className="mt-8">
          <h2 className="editorial text-2xl">Dernières opérations auditées</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {audit.map((a) => (
              <li key={a.id}>
                {a.createdAt.toLocaleString("fr-FR", { timeZone: "UTC" })} UTC ·{" "}
                {a.action} · {a.targetType}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
