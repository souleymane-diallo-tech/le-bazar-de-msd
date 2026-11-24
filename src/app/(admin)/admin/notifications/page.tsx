import Link from "next/link";
import { getDb } from "@/lib/db";
import { requirePermission } from "@/modules/identity/session";
import {
  notificationLabels,
  notificationMode,
} from "@/modules/notifications/config";
import { AdminForm } from "@/components/admin/form";
import { Hidden } from "@/components/admin/fields";
export default async function NotificationsPage() {
  const actor = await requirePermission("orders:manage");
  const rows = await getDb().orderNotification.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { order: { select: { reference: true } } },
  });
  const mode = notificationMode();
  return (
    <>
      <h1 className="editorial text-4xl">Notifications WhatsApp</h1>
      <p className="my-4">
        {mode === "meta"
          ? "Envoi automatique configuré."
          : mode === "simulated"
            ? "Mode simulation : aucun message envoyé."
            : "Envoi automatique désactivé."}
      </p>
      {actor.roleId === "OWNER" && (
        <AdminForm
          action="notification-dispatch"
          submit="Reprendre les notifications en attente"
        />
      )}
      <p className="my-4 text-sm">
        50 notifications les plus récentes. Une livraison WhatsApp ne confirme
        aucun paiement. Les envois incertains doivent être vérifiés avant toute
        nouvelle tentative.
      </p>
      <div className="space-y-4">
        {rows.map((n) => (
          <article key={n.id} className="rounded-xl border p-4 break-words">
            <Link className="underline" href={`/admin/commandes/${n.orderId}`}>
              {n.order.reference}
            </Link>
            <p>
              {n.kind === "CUSTOMER_ORDER_RECEIVED" ? "Client" : "Gérant"} ·{" "}
              {notificationLabels[n.state]} · {n.attempts} tentative(s)
            </p>
            <p className="text-sm">
              Destinataire :{" "}
              {n.recipient ? `•••• ${n.recipient.slice(-4)}` : "non configuré"}
            </p>
            {n.errorCode && (
              <p className="text-sm">Diagnostic : {n.errorCode}</p>
            )}
            {actor.roleId === "OWNER" &&
              n.state === "FAILED" &&
              !n.providerMessageId && (
                <AdminForm
                  action="notification-retry"
                  submit="Relancer après correction"
                >
                  <Hidden name="notificationId" value={n.id} />
                </AdminForm>
              )}
          </article>
        ))}
      </div>
      {!rows.length && <p className="my-8">Aucune notification enregistrée.</p>}
    </>
  );
}
