import { getDb } from "@/lib/db";
import { getOrderPolicy } from "@/modules/orders/runtime";
import { CheckoutForm } from "@/components/store/checkout-form";
export const dynamic = "force-dynamic";
export default async function CheckoutPage() {
  const enabled = getOrderPolicy().enabled;
  const zones = enabled
    ? await getDb().deliveryZone.findMany({
        where: { active: true, isDemo: true },
        select: { id: true, name: true, feeXof: true },
        orderBy: { name: "asc" },
      })
    : [];
  return (
    <main id="contenu" className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
      <p className="text-sm text-muted-foreground">
        Démonstration · Paiement à la livraison simulé
      </p>
      <h1 className="editorial mb-8 mt-3 text-4xl">Votre commande de test</h1>
      {enabled ? (
        <CheckoutForm zones={zones} />
      ) : (
        <p>Les commandes sont actuellement désactivées.</p>
      )}
    </main>
  );
}
