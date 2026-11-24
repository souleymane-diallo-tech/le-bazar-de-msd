import { CartContent } from "@/components/store/cart-content";
import { getOrderPolicy } from "@/modules/orders/runtime";
export const dynamic = "force-dynamic";
export const metadata = { title: "Votre panier" };
export default function CartPage() {
  return (
    <main
      id="contenu"
      className="cart-page mx-auto max-w-7xl px-4 py-5 sm:px-8"
    >
      <h1 className="mb-5 text-2xl font-bold tracking-tight sm:text-4xl">
        Votre panier
      </h1>
      <CartContent checkoutEnabled={getOrderPolicy().enabled} />
    </main>
  );
}
