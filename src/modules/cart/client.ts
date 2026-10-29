"use client";
import { useSyncExternalStore } from "react";
import {
  parseCart,
  normalizeCart,
  MAX_CART_QUANTITY,
  type CartItem,
} from "./rules";

const key = "msd.cart.v1";
const changed = "msd-cart-change";
let memory: string | null = null;
let memoryOnly = false;
function read() {
  try {
    return memoryOnly ? memory : window.localStorage.getItem(key);
  } catch {
    return memory;
  }
}
function subscribe(callback: () => void) {
  window.addEventListener(changed, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(changed, callback);
    window.removeEventListener("storage", callback);
  };
}
function write(items: CartItem[]) {
  memory = JSON.stringify({
    version: 1,
    items: normalizeCart(items).slice(0, 50),
  });
  try {
    window.localStorage.setItem(key, memory);
    memoryOnly = false;
  } catch {
    memoryOnly = true;
  }
  window.dispatchEvent(new Event(changed));
  return !memoryOnly;
}
export function useCart() {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  return {
    raw,
    items: parseCart(raw),
    count: parseCart(raw).reduce((sum, item) => sum + item.quantity, 0),
  };
}
export function addToCart(
  variantId: string,
  quantity: number,
  available: number,
  seenPriceXof: number,
) {
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_CART_QUANTITY
  )
    return { ok: false, message: "Choisissez une quantité valide." };
  const items = parseCart(read());
  const previous =
    items.find((item) => item.variantId === variantId)?.quantity ?? 0;
  if (items.length >= 50 && !previous)
    return {
      ok: false,
      message: "Votre panier contient déjà 50 articles différents.",
    };
  if (previous + quantity > Math.min(MAX_CART_QUANTITY, available))
    return {
      ok: false,
      message:
        "La quantité demandée dépasse le stock disponible, panier inclus.",
    };
  const persisted = write([
    ...items.filter((item) => item.variantId !== variantId),
    { variantId, quantity: previous + quantity, seenPriceXof },
  ]);
  return {
    ok: true,
    message: persisted
      ? "Article ajouté à votre panier."
      : "Article ajouté. Votre navigateur ne permet pas de conserver le panier après fermeture.",
  };
}
export function setCartQuantity(variantId: string, quantity: number) {
  const items = parseCart(read());
  write(
    items.flatMap((item) =>
      item.variantId !== variantId
        ? [item]
        : quantity <= 0
          ? []
          : [
              {
                ...item,
                quantity: Math.min(
                  MAX_CART_QUANTITY,
                  Math.max(1, Math.floor(quantity)),
                ),
              },
            ],
    ),
  );
}
