"use client";
import { useEffect, useState } from "react";
import Image from "./product-image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCart, setCartQuantity, addToCart } from "@/modules/cart/client";
import { parseCart, type CartQuote } from "@/modules/cart/rules";
import { formatPrice } from "@/modules/catalog/rules";
import { Button } from "@/components/ui/button";

export function CartContent({
  checkoutEnabled = false,
}: {
  checkoutEnabled?: boolean;
}) {
  const { raw, items, ready } = useCart();
  const [notice, setNotice] = useState("");
  const [removed, setRemoved] = useState<{
    variantId: string;
    quantity: number;
    available: number;
    priceXof: number;
  } | null>(null);
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
  const verified = !loading && !result?.error && Boolean(quote);
  const canCheckout = verified && !quote?.hasIssues;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const feedback = (
    <div role="status" aria-live="polite">
      {notice && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-secondary px-4 py-2 text-sm">
          <span>{notice}</span>
          {removed && (
            <button
              className="min-h-11 font-semibold underline"
              type="button"
              onClick={() => {
                const result = addToCart(
                  removed.variantId,
                  removed.quantity,
                  removed.available,
                  removed.priceXof,
                );
                setNotice(
                  result.ok
                    ? "Article rétabli dans le panier."
                    : result.message,
                );
                if (result.ok) setRemoved(null);
              }}
            >
              Annuler le retrait
            </button>
          )}
        </div>
      )}
    </div>
  );
  if (!ready)
    return (
      <p role="status" className="rounded-xl bg-secondary p-5">
        Chargement de votre panier…
      </p>
    );
  if (!items.length)
    return (
      <div>
        {feedback}
        <div className="rounded-2xl border border-primary/15 bg-white px-5 py-10 text-center">
          <ShoppingBag
            size={40}
            className="mx-auto text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="mt-5 text-2xl font-bold">
            Votre panier attend ses essentiels.
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            Parcourez la collection et ajoutez les objets qui vous plaisent.
          </p>
          <Button asChild className="mt-7">
            <Link href="/catalogue">Découvrir la collection</Link>
          </Button>
        </div>
      </div>
    );
  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
      <div aria-busy={loading}>
        {feedback}
        <p className="mb-3 text-sm text-muted-foreground">
          {itemCount} article{itemCount > 1 ? "s" : ""} dans votre panier
        </p>
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
          <ul className="space-y-3">
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
                    className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-xl border border-primary/15 bg-white p-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:p-4"
                  >
                    <div className="relative h-24 overflow-hidden rounded-lg bg-white sm:h-32">
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
                          className="inline-flex min-h-11 items-center text-sm font-semibold hover:underline sm:text-base"
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
                    </div>
                    <div className="col-span-2 flex flex-wrap items-center gap-3 border-t border-primary/10 pt-3">
                      <label
                        className="text-xs font-semibold"
                        htmlFor={`qty-${line.variantId}`}
                      >
                        Quantité
                        <span className="sr-only"> pour {line.name}</span>
                      </label>
                      <select
                        id={`qty-${line.variantId}`}
                        value={item.quantity}
                        onChange={(event) => {
                          setNotice("Quantité modifiée.");
                          setRemoved(null);
                          setCartQuantity(
                            line.variantId,
                            Number(event.target.value),
                          );
                        }}
                        className="min-h-11 rounded-lg border border-border bg-white px-3 text-base"
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
                        onClick={() => {
                          setRemoved({
                            variantId: line.variantId,
                            quantity: item.quantity,
                            available: line.available,
                            priceXof: line.priceXof ?? item.seenPriceXof ?? 0,
                          });
                          setNotice(`${line.name} retiré du panier.`);
                          setCartQuantity(line.variantId, 0);
                        }}
                        className="inline-flex min-h-11 items-center gap-1 text-sm underline"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Retirer
                      </button>
                      <strong className="ml-auto text-base">
                        {loading ? "…" : formatPrice(line.lineTotalXof)}
                      </strong>
                    </div>
                    {!loading && line.priceChanged && (
                      <p
                        role="status"
                        className="col-span-2 rounded-lg bg-secondary p-3 text-sm text-primary"
                      >
                        Le prix a changé depuis l’ajout au panier. Le montant
                        affiché a été actualisé.
                      </p>
                    )}
                    {!loading && line.issue && (
                      <p
                        role="alert"
                        className="col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-800"
                      >
                        {line.issue}
                      </p>
                    )}
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
        className="self-start rounded-2xl border border-primary/15 bg-secondary p-4 sm:p-6 lg:sticky lg:top-40"
        aria-labelledby="summary-title"
      >
        <h2 id="summary-title" className="text-xl font-bold">
          Récapitulatif
        </h2>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt>Sous-total des articles</dt>
            <dd className="font-semibold">
              {!verified || !quote
                ? "À vérifier"
                : formatPrice(quote.subtotalXof)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Livraison</dt>
            <dd className="text-right">Calculée à l’étape suivante</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-primary/20 pt-4">
            <dt className="font-semibold">Total livré</dt>
            <dd className="text-right">Après choix de votre zone</dd>
          </div>
        </dl>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Les frais seront affichés selon votre zone avant validation de la
          commande. Aucun stock n’est réservé par le panier.
        </p>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/15 bg-background px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-lg lg:static lg:mt-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <p className="mb-2 flex justify-between gap-2 text-sm lg:hidden">
            <span>Articles, hors livraison</span>
            <strong>
              {verified && quote
                ? formatPrice(quote.subtotalXof)
                : "À vérifier"}
            </strong>
          </p>
          {checkoutEnabled && canCheckout ? (
            <Button asChild className="w-full">
              <Link href="/commande">Tester la commande</Link>
            </Button>
          ) : (
            <Button className="w-full" disabled>
              {checkoutEnabled
                ? loading
                  ? "Vérification du panier…"
                  : "Panier à vérifier"
                : "Commandes bientôt disponibles"}
            </Button>
          )}
        </div>
        <p className="mt-3 text-sm">
          {checkoutEnabled
            ? "Commande de démonstration : aucune vente ni livraison réelle."
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
