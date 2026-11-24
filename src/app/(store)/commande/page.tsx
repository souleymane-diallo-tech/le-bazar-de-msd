import { getDb } from "@/lib/db";
import { getOrderPolicy } from "@/modules/orders/runtime";
import { CheckoutForm } from "@/components/store/checkout-form";
import Link from "next/link";
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
    <main id="contenu" className="mx-auto max-w-6xl px-4 py-5 sm:px-8">
      <Link
        href="/panier"
        className="mb-2 inline-flex min-h-11 items-center text-sm underline"
      >
        ← Retour au panier
      </Link>
      <p className="text-sm text-muted-foreground">
        Démonstration · Paiement à la livraison simulé
      </p>
      <h1 className="mb-5 mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
        Votre commande de test
      </h1>
      {enabled ? (
        <CheckoutForm
          zones={zones}
          customerWhatsappEnabled={!!getOrderPolicy().customerRecipients.length}
        />
      ) : (
        <p>Les commandes sont actuellement désactivées.</p>
      )}
    </main>
  );
}
