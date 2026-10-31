"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart, setCartQuantity } from "@/modules/cart/client";
import { formatPrice } from "@/modules/catalog/rules";
import { stateLabels, checkoutSchema } from "@/modules/orders/rules";
import type { createQuote, readConfirmation } from "@/modules/orders/service";
import { Button } from "@/components/ui/button";
type Quote = Awaited<ReturnType<typeof createQuote>>;
type Confirmation = Awaited<ReturnType<typeof readConfirmation>>;
const field =
  "mt-1 min-h-11 w-full rounded-lg border border-border bg-white px-3 py-2";
async function call(action: string, data: unknown) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(result.error), { status: response.status });
  return result;
}
export function CheckoutForm({
  zones,
}: {
  zones: { id: string; name: string; feeXof: number }[];
}) {
  const { items } = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [contact, setContact] = useState<Record<string, FormDataEntryValue>>(
    {},
  );
  const [credentials, setCredentials] = useState<{
    idempotencyKey: string;
    accessToken: string;
  } | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<{
    reference: string;
    accessToken: string;
  } | null>(null);
  const [attempted, setAttempted] = useState(false);
  const basket = items.map(({ variantId, quantity }) => ({
    variantId,
    quantity,
  }));
  const inputKey = JSON.stringify(basket);
  const [quotedKey, setQuotedKey] = useState("");
  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (sessionStorage.getItem("msd.pending-order.v1"))
        throw new Error(
          "Une demande attend sa confirmation. Utilisez « Retrouver ma dernière confirmation » avant de recommencer.",
        );
      const result = await call("quote", {
        zoneId: data.zoneId,
        items: basket,
      });
      setContact(data);
      setQuote(result);
      setQuotedKey(inputKey);
      setCredentials({
        idempotencyKey: crypto.randomUUID(),
        accessToken: Array.from(
          crypto.getRandomValues(new Uint8Array(32)),
          (n) => n.toString(16).padStart(2, "0"),
        ).join(""),
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!quote || !credentials || quotedKey !== inputKey) return;
    setBusy(true);
    setError("");
    setAttempted(true);
    try {
      const request = checkoutSchema.parse({
        ...contact,
        ...credentials,
        items: basket,
        quoteToken: quote.quoteToken,
        demoAcknowledged: true,
      });
      // Persist only this explicitly fictitious request for retry after a lost response/reload.
      sessionStorage.setItem("msd.pending-order.v1", JSON.stringify(request));
      const result = await call("place", request);
      const receipt = {
        reference: result.reference as string,
        accessToken: credentials.accessToken,
      };
      setPlaced(receipt);
      sessionStorage.removeItem("msd.pending-order.v1");
      // Token stays in this tab's session storage, never in the URL or public reference.
      try {
        sessionStorage.setItem("msd.last-order", JSON.stringify(receipt));
      } catch {
        /* Confirmation is still available in memory. */
      }
      const confirmed = await call("read", receipt);
      setConfirmation(confirmed);
      for (const item of items) setCartQuantity(item.variantId, 0);
    } catch (e) {
      if ([400, 409].includes((e as { status?: number }).status ?? 0)) {
        setAttempted(false);
        setQuote(null);
        sessionStorage.removeItem("msd.pending-order.v1");
      }
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function recover() {
    setBusy(true);
    setError("");
    try {
      let receipt =
        placed ??
        JSON.parse(sessionStorage.getItem("msd.last-order") ?? "null");
      const pending = sessionStorage.getItem("msd.pending-order.v1");
      if (pending) {
        const request = checkoutSchema.parse(JSON.parse(pending));
        const result = await call("place", request);
        receipt = {
          reference: result.reference,
          accessToken: request.accessToken,
        };
        sessionStorage.setItem("msd.last-order", JSON.stringify(receipt));
        sessionStorage.removeItem("msd.pending-order.v1");
      }
      if (!receipt)
        throw new Error("Aucune confirmation enregistrée dans cet onglet.");
      setConfirmation(await call("read", receipt));
    } catch (e) {
      if ([400, 409].includes((e as { status?: number }).status ?? 0)) {
        sessionStorage.removeItem("msd.pending-order.v1");
        setAttempted(false);
        setQuote(null);
      }
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (confirmation)
    return (
      <section
        className="rounded-2xl bg-secondary p-6 sm:p-10"
        aria-live="polite"
      >
        <p className="text-sm font-semibold">
          Simulation enregistrée · Aucun achat réel
        </p>
        <h2 className="editorial mt-4 text-3xl">
          Votre commande de test est reçue.
        </h2>
        <p className="mt-4 break-all text-sm">
          Référence : {confirmation.reference}
        </p>
        <p className="mt-3">
          {stateLabels[confirmation.status]} ·{" "}
          {confirmation.collected
            ? "Collecte simulée enregistrée"
            : "Non encaissée"}
        </p>
        <ul className="my-6 space-y-3">
          {confirmation.items.map((item, i) => (
            <li key={i}>
              {item.quantity} × {item.name} — {formatPrice(item.lineTotalXof)}
            </li>
          ))}
        </ul>
        <p>Livraison fictive : {formatPrice(confirmation.deliveryXof)}</p>
        <p className="mt-3 text-xl font-bold">
          Total : {formatPrice(confirmation.totalXof)}
        </p>
        <p className="mt-5 text-sm">
          Aucune livraison ni collecte réelle. La réservation de test expire
          après 24 h si elle n’est pas confirmée.
        </p>
        <Button className="mt-6" onClick={recover} disabled={busy}>
          Actualiser le suivi
        </Button>{" "}
        <Link
          href="/catalogue"
          className="ml-3 inline-flex min-h-11 items-center underline"
        >
          Retour au catalogue
        </Link>
      </section>
    );
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <form
        onSubmit={prepare}
        onChange={() => {
          if (!attempted) setQuote(null);
        }}
        className="space-y-5 rounded-2xl border border-border bg-white p-5 sm:p-8"
      >
        <fieldset disabled={attempted || busy} className="space-y-5">
          <h2 className="editorial text-2xl">Coordonnées de test</h2>
          <p className="text-sm text-muted-foreground">
            Utilisez uniquement des informations fictives. Aucun achat, paiement
            ou envoi réel.
          </p>
          <label className="block">
            Nom fictif
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="off"
              className={field}
            />
          </label>
          <label className="block">
            Téléphone fictif
            <input
              name="phone"
              type="tel"
              required
              pattern="\+2217[05678][0-9]{7}"
              placeholder="+221770000000"
              className={field}
            />
            <span className="text-xs">Format : +221 suivi de 9 chiffres.</span>
          </label>
          <label className="block">
            Zone de livraison
            <select name="zoneId" required className={field}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} — {formatPrice(z.feeXof)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Quartier fictif
            <input
              name="district"
              required
              minLength={2}
              maxLength={100}
              className={field}
            />
          </label>
          <label className="block">
            Adresse fictive
            <textarea
              name="address"
              required
              minLength={5}
              maxLength={300}
              className={field}
            />
          </label>
          <label className="block">
            Repère ou instructions
            <textarea name="instructions" maxLength={300} className={field} />
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" required className="mt-1 size-5" />
            Je comprends qu’il s’agit d’une simulation avec données fictives.
          </label>
          <Button
            type="submit"
            disabled={
              busy || !items.length || !zones.length || !!placed || attempted
            }
          >
            Vérifier le total
          </Button>
        </fieldset>
      </form>
      <section
        className="self-start rounded-2xl bg-secondary p-6 sm:p-8"
        aria-live="polite"
      >
        <h2 className="editorial text-2xl">Avant de confirmer</h2>
        {!items.length && (
          <p className="mt-4">
            Votre panier est vide.{" "}
            <Link href="/catalogue" className="underline">
              Découvrir les produits
            </Link>
          </p>
        )}
        {quote && (
          <>
            <ul className="mt-5 space-y-3">
              {quote.lines.map((l) => (
                <li key={l.variantId}>
                  {l.quantity} × {l.name}
                  <strong className="block">
                    {formatPrice(l.lineTotalXof)}
                  </strong>
                </li>
              ))}
            </ul>
            <p className="mt-5">
              Livraison fictive : {formatPrice(quote.deliveryXof)}
            </p>
            <p className="mt-3 text-xl font-bold">
              Total : {formatPrice(quote.totalXof)}
            </p>
            <p className="mt-4 text-sm">
              Destinataire : {String(contact.name)}. {String(contact.address)},{" "}
              {String(contact.district)}. Paiement à la livraison simulé.
            </p>
            <Button
              className="mt-6 w-full"
              disabled={busy || quotedKey !== inputKey || !!placed}
              onClick={submit}
            >
              Confirmer la commande de test
            </Button>
            {quotedKey !== inputKey && (
              <p className="mt-3">
                Le panier a changé. Vérifiez à nouveau le total.
              </p>
            )}
          </>
        )}
        {!quote && (
          <p className="mt-4 text-sm">
            Les prix et frais sont calculés par le serveur. Vérifiez le
            récapitulatif avant de confirmer.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-5 text-sm text-red-800">
            {error}
          </p>
        )}
        {busy && (
          <p role="status" className="mt-4">
            Vérification en cours…
          </p>
        )}
        <button
          type="button"
          onClick={recover}
          disabled={busy}
          className="mt-6 min-h-11 text-sm underline"
        >
          Retrouver ma dernière confirmation dans cet onglet
        </button>
      </section>
    </div>
  );
}
