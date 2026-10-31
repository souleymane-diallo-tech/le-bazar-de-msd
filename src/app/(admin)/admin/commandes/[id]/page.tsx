import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { requirePermission } from "@/modules/identity/session";
import {
  stateLabels,
  transitions,
  paymentLabels,
  reservationLabels,
} from "@/modules/orders/rules";
import { formatPrice } from "@/modules/catalog/rules";
import { AdminForm } from "@/components/admin/form";
import { Field, Hidden, inputClass } from "@/components/admin/fields";
export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requirePermission("orders:manage");
  const { id } = await params;
  const order = await getDb().order.findFirst({
    where: { id, isDemo: true },
    include: {
      items: { include: { reservation: true } },
      payments: { include: { refunds: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      shipment: true,
    },
  });
  if (!order) notFound();
  const contact = order.contactSnapshot as Record<string, string>;
  const address = order.addressSnapshot as Record<string, string>;
  const payment = order.payments[0];
  return (
    <>
      <p className="break-all text-sm">{order.reference}</p>
      <h1 className="editorial mt-3 text-4xl">{stateLabels[order.status]}</h1>
      <p className="mt-3 text-sm">
        Simulation uniquement · Aucun encaissement réel
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl bg-white p-5">
          <h2 className="editorial text-2xl">Commande & destinataire</h2>
          <p>
            {contact.name} · {contact.phone}
          </p>
          <p>
            {address.address}, {address.district} · {address.zoneName}
          </p>
          <p>{address.instructions}</p>
          <ul className="space-y-3">
            {order.items.map((i) => (
              <li key={i.id}>
                {i.quantity} × {i.nameSnapshot} — {formatPrice(i.lineTotalXof)}
                <span className="block text-xs">
                  Réservation :{" "}
                  {i.reservation
                    ? reservationLabels[i.reservation.status]
                    : "Absente"}
                  {i.reservation?.expiresAt
                    ? ` · échéance ${i.reservation.expiresAt.toLocaleString("fr-FR", { timeZone: "UTC" })} UTC`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
          <p>Livraison : {formatPrice(order.deliveryXof)}</p>
          <strong className="block text-xl">
            Total : {formatPrice(order.totalXof)}
          </strong>
          {["PENDING_CONFIRMATION", "CONFIRMED", "PREPARING"].includes(
            order.status,
          ) && (
            <details>
              <summary className="min-h-11 cursor-pointer underline">
                Corriger l’adresse dans la même zone
              </summary>
              <AdminForm action="address">
                <Hidden name="orderId" value={order.id} />
                <Hidden name="version" value={order.version} />
                <Field
                  name="district"
                  label="Quartier"
                  value={address.district}
                />
                <Field name="address" label="Adresse" value={address.address} />
                <Field
                  name="instructions"
                  label="Repère"
                  value={address.instructions}
                  required={false}
                />
                <Field name="reason" label="Motif de la correction" />
              </AdminForm>
            </details>
          )}
        </section>
        <section className="space-y-6 rounded-xl bg-secondary p-5">
          <h2 className="editorial text-2xl">Traitement</h2>
          {!!transitions[order.status].length && (
            <AdminForm action="transition" submit="Appliquer la transition">
              <Hidden name="orderId" value={order.id} />
              <label className="block text-sm">
                Nouvel état
                <select name="next" className={inputClass}>
                  {transitions[order.status].map((s) => (
                    <option key={s} value={s}>
                      {stateLabels[s]}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                name="reason"
                label="Motif / preuve de livraison ou de retour physique"
              />
            </AdminForm>
          )}
          <div className="border-t border-primary/20 pt-5">
            <h3 className="font-semibold">Encaissement simulé</h3>
            <p className="my-3 text-sm">
              État : {payment ? paymentLabels[payment.status] : "Absent"}. La
              livraison ne vaut pas encaissement.
            </p>
            {order.status === "DELIVERED" && payment?.status === "PENDING" && (
              <AdminForm
                action="collect"
                submit="Enregistrer la collecte fictive"
              >
                <Hidden name="orderId" value={order.id} />
                <Field name="reference" label="Référence de collecte fictive" />
              </AdminForm>
            )}
            {actor.roleId === "OWNER" &&
              payment &&
              ["SUCCEEDED", "PARTIALLY_REFUNDED"].includes(payment.status) && (
                <AdminForm
                  action="refund"
                  submit="Enregistrer le remboursement fictif"
                >
                  <Hidden name="orderId" value={order.id} />
                  <Hidden name="operationKey" value={randomUUID()} />
                  <Field
                    name="amountXof"
                    label="Montant remboursé en FCFA"
                    type="number"
                  />
                  <Field name="reason" label="Justification du remboursement" />
                </AdminForm>
              )}
            {payment?.refunds.map((r) => (
              <p key={r.id} className="mt-3 text-sm">
                Remboursement simulé : {formatPrice(r.amountXof)} · {r.reason}
              </p>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-8">
        <h2 className="editorial text-2xl">Historique</h2>
        <ol className="mt-5 space-y-3">
          {order.statusHistory.map((h) => (
            <li key={h.id} className="rounded-lg border border-border p-4">
              <strong>{stateLabels[h.toStatus]}</strong> ·{" "}
              {h.createdAt.toLocaleString("fr-FR", { timeZone: "UTC" })} UTC
              <p className="mt-2 text-sm">{h.reason}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
