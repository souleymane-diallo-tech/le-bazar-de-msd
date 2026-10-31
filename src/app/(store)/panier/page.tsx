import { CartContent } from "@/components/store/cart-content";
import { getOrderPolicy } from "@/modules/orders/runtime";
export const dynamic = "force-dynamic";
export const metadata = { title: "Votre panier" };
export default function CartPage() {
  return (
    <main id="contenu" className="mx-auto max-w-7xl px-5 py-10 sm:px-10">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Vos essentiels
      </p>
      <h1 className="editorial mb-9 mt-3 text-4xl sm:text-5xl">Votre panier</h1>
      <CartContent checkoutEnabled={getOrderPolicy().enabled} />
    </main>
  );
}
