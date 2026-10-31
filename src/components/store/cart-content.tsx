"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCart, setCartQuantity } from "@/modules/cart/client";
import { parseCart, type CartQuote } from "@/modules/cart/rules";
import { formatPrice } from "@/modules/catalog/rules";
import { Button } from "@/components/ui/button";

export function CartContent({
  checkoutEnabled = false,
}: {
  checkoutEnabled?: boolean;
}) {
  const { raw, items } = useCart();
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    quote?: CartQuote;
    error?: string;
  } | null>(null);
  const requestKey = `${raw}:${revision}`;
  useEffect(() => {
    const parsed = parseCart(raw);
    if (!parsed.length) return;
    const controller = new AbortController();
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: 1, items: parsed }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const quote: CartQuote = await response.json();
        setResult({ key: requestKey, quote });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            key: requestKey,
            error:
              "Impossible de vérifier les prix et les stocks. Votre panier est conservé.",
          });
      });
    return () => controller.abort();
  }, [raw, requestKey]);
  const loading = result?.key !== requestKey;
  const quote = result?.quote;
  if (!items.length)
    return (
      <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
        <ShoppingBag
          size={40}
          className="mx-auto text-muted-foreground"
          aria-hidden="true"
        />
        <h2 className="editorial mt-5 text-3xl">
          Votre panier attend ses essentiels.
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
          Parcourez la collection et ajoutez les objets qui vous plaisent.
        </p>
        <Button asChild className="mt-7">
          <Link href="/catalogue">Découvrir la collection</Link>
        </Button>
      </div>
    );
  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div aria-busy={loading}>
        {loading && (
          <p role="status" className="mb-4 text-sm text-muted-foreground">
            Vérification des prix et des stocks…
          </p>
        )}
        {result?.key === requestKey && result.error && (
          <div role="alert" className="rounded-xl bg-white p-6">
            <p>{result.error}</p>
            <Button className="mt-4" onClick={() => setRevision((v) => v + 1)}>
              Réessayer
            </Button>
            <div className="mt-4 space-y-2">
              {items.map((item, i) => (
                <button
                  key={item.variantId}
                  className="block min-h-11 text-sm underline"
                  onClick={() => setCartQuantity(item.variantId, 0)}
                >
                  Retirer l’article {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        {quote && (
          <ul className="divide-y divide-primary/15">
            {quote.lines
              .filter((line) =>
                items.some((item) => item.variantId === line.variantId),
              )
              .map((line) => {
                const item = items.find(
                  (item) => item.variantId === line.variantId,
                )!;
                return (
                  <li
                    key={line.variantId}
                    className="flex gap-4 py-6 first:pt-0"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white sm:h-32 sm:w-28">
                      {line.image && (
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="112px"
                          className="object-contain"
                        />
                      )}
                    </div>
                    <div className="min-w-0 grow">
                      {line.slug ? (
                        <Link
                          href={`/produits/${line.slug}`}
                          className="font-semibold hover:underline"
                        >
                          {line.name}
                        </Link>
                      ) : (
                        <h2 className="font-semibold">{line.name}</h2>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {line.label}
                        {line.isDemo ? " · Démonstration" : ""}
                      </p>
                      {line.priceXof !== null && (
                        <p className="mt-2 text-sm">
                          {formatPrice(line.priceXof)} / unité
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label
                          className="sr-only"
                          htmlFor={`qty-${line.variantId}`}
                        >
                          Quantité pour {line.name}
                        </label>
                        <select
                          id={`qty-${line.variantId}`}
                          value={item.quantity}
                          onChange={(event) =>
                            setCartQuantity(
                              line.variantId,
                              Number(event.target.value),
                            )
                          }
                          className="min-h-11 rounded-lg border border-border bg-white px-3"
                        >
                          {Array.from(
                            {
                              length: Math.min(
                                99,
                                Math.max(item.quantity, line.available, 1),
                              ),
                            },
                            (_, i) => i + 1,
                          ).map((n) => (
                            <option value={n} key={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          aria-label={`Retirer ${line.name}`}
                          onClick={() => setCartQuantity(line.variantId, 0)}
                          className="inline-flex min-h-11 items-center gap-1 text-sm underline"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          Retirer
                        </button>
                        <strong className="ml-auto text-sm">
                          {loading ? "…" : formatPrice(line.lineTotalXof)}
                        </strong>
                      </div>
                      {!loading && line.priceChanged && (
                        <p role="status" className="mt-3 text-sm text-primary">
                          Le prix a changé depuis l’ajout au panier. Le montant
                          affiché a été actualisé.
                        </p>
                      )}
                      {!loading && line.issue && (
                        <p role="alert" className="mt-3 text-sm text-red-800">
                          {line.issue}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
        <Link
          href="/catalogue"
          className="mt-6 inline-flex min-h-11 items-center text-sm underline"
        >
          ← Continuer la découverte
        </Link>
      </div>
      <aside
        className="self-start rounded-2xl bg-secondary p-6 sm:p-8"
        aria-labelledby="summary-title"
      >
        <h2 id="summary-title" className="editorial text-2xl">
          Votre sélection
        </h2>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt>Sous-total des articles</dt>
            <dd className="font-semibold">
              {loading || !quote
                ? "À vérifier"
                : formatPrice(quote.subtotalXof)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Livraison</dt>
            <dd>À déterminer</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-primary/20 pt-4">
            <dt className="font-semibold">Total livré</dt>
            <dd>Non disponible</dd>
          </div>
        </dl>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Les frais seront affichés selon votre zone avant validation de la
          commande. Aucun stock n’est réservé par le panier.
        </p>
        {checkoutEnabled ? (
          <Button asChild className="mt-6 w-full">
            <Link href="/commande">Tester la commande</Link>
          </Button>
        ) : (
          <Button className="mt-6 w-full" disabled>
            Commandes bientôt disponibles
          </Button>
        )}
        <p className="mt-3 text-sm">
          {checkoutEnabled
            ? "Checkout de démonstration : aucune vente ni livraison réelle."
            : "Ce parcours s’arrête au panier pour le moment. Aucun paiement ne sera demandé."}
        </p>
        {quote?.lines.some((line) => line.isDemo) && (
          <p className="mt-4 border-t border-primary/20 pt-4 text-xs font-semibold">
            Articles de démonstration : prix et stocks fictifs.
          </p>
        )}
        {!loading && quote?.hasIssues && (
          <p role="alert" className="mt-4 text-sm text-red-800">
            Certains articles nécessitent une modification.
          </p>
        )}
      </aside>
    </div>
  );
}
