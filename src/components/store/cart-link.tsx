"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/modules/cart/client";
export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/panier"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm font-semibold"
      aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}
    >
      <ShoppingBag size={18} aria-hidden="true" />
      <span>Panier</span>
      <span
        className="inline-flex min-w-5 justify-center rounded-full bg-primary px-1 text-xs leading-5 text-white"
        aria-hidden="true"
      >
        {count}
      </span>
    </Link>
  );
}
