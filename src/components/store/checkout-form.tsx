"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart, setCartQuantity } from "@/modules/cart/client";
import { formatPrice } from "@/modules/catalog/rules";
import { stateLabels, checkoutSchema } from "@/modules/orders/rules";
import type { createQuote, readConfirmation } from "@/modules/orders/service";
import { Button } from "@/components/ui/button";
type Quote = Awaited<ReturnType<typeof createQuote>>;
type Confirmation = Awaited<ReturnType<typeof readConfirmation>>;
const field =
  "mt-1 min-h-12 w-full rounded-lg border border-primary/30 bg-white px-3 py-2 text-base aria-invalid:border-red-700";
async function call(action: string, data: unknown) {
  let response: Response;
  try {
    response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new Error(
      action === "place"
        ? "Réponse indisponible. Votre commande a peut-être été enregistrée. Utilisez « Retrouver ma dernière confirmation » avant de recommencer."
        : "Connexion indisponible ou trop lente. Réessayez ; votre saisie est conservée.",
    );
  }
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(result.error), { status: response.status });
  return result;
}
export function CheckoutForm({
  zones,
  customerWhatsappEnabled = false,
}: {
  customerWhatsappEnabled?: boolean;
  zones: { id: string; name: string; feeXof: number }[];
}) {
  const { items, ready } = useCart();
  const operation = useRef(false);
  const [busyLabel, setBusyLabel] = useState("Vérification en cours…");
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const summaryRef = useRef<HTMLElement>(null);
  const receiptRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const target = confirmation
      ? receiptRef.current
      : quote || error
        ? summaryRef.current
        : null;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "start" });
  }, [quote, confirmation, error]);
  function fieldError(name: string) {
    return fieldErrors[name] ? (
      <span id={`error-${name}`} className="mt-1 block text-sm text-red-800">
        {fieldErrors[name]}
      </span>
    ) : null;
  }
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
    if (operation.current) return;
    operation.current = true;
    setBusyLabel("Calcul du total en cours…");
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
      operation.current = false;
      setBusy(false);
    }
  }
  async function submit() {
    if (operation.current || !quote || !credentials || quotedKey !== inputKey)
      return;
    operation.current = true;
    setBusyLabel("Enregistrement de votre commande…");
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
        customerWhatsappConsent: contact.customerWhatsappConsent === "on",
      });
      // Tab-only recovery data may include the explicitly consented test WhatsApp number.
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
      operation.current = false;
      setBusy(false);
    }
  }
  async function recover() {
    if (operation.current) return;
    operation.current = true;
    setBusyLabel("Recherche de votre confirmation…");
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
      operation.current = false;
      setBusy(false);
    }
  }
  if (confirmation)
    return (
      <section
        ref={receiptRef}
        tabIndex={-1}
        aria-label="Confirmation de commande"
        className="scroll-mt-48 rounded-2xl border border-primary/15 bg-secondary p-4 sm:p-8"
        aria-live="polite"
      >
        <p className="text-sm font-semibold">
          Simulation enregistrée · Aucun achat réel
        </p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
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
        <ul className="my-5 divide-y divide-primary/15 rounded-xl bg-white px-3">
          {confirmation.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 py-3 text-sm">
              <span>
                {item.quantity} × {item.name}
              </span>
              <strong className="shrink-0">
                {formatPrice(item.lineTotalXof)}
              </strong>
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
        <Button
          className="mt-6 w-full sm:w-auto"
          onClick={recover}
          disabled={busy}
        >
          {busy ? "Actualisation en cours…" : "Actualiser le suivi"}
        </Button>{" "}
        <Link
          href="/catalogue"
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center underline sm:ml-3 sm:w-auto"
        >
          Retour au catalogue
        </Link>
        {confirmation.customerNotification && (
          <p className="mt-5 text-sm" role="status">
            Confirmation WhatsApp client :{" "}
            {["DELIVERED", "READ"].includes(confirmation.customerNotification)
              ? "livrée"
              : confirmation.customerNotification === "SENT"
                ? "transmise à WhatsApp"
                : ["FAILED", "UNCERTAIN", "CANCELLED"].includes(
                      confirmation.customerNotification,
                    )
                  ? "envoi non confirmé ; votre commande reste enregistrée"
                  : confirmation.customerNotification === "SIMULATED"
                    ? "simulée, aucun message envoyé"
                    : "en attente d’envoi"}
            .
          </p>
        )}
        {confirmation.automaticNotification ? (
          <p className="mt-6 rounded-xl border border-border bg-white p-5 text-sm">
            Votre commande est enregistrée. Une notification WhatsApp au gérant
            est prise en charge par la boutique. Vous n’avez aucun message à
            envoyer ; la notification ne confirme ni la livraison ni le
            paiement.
          </p>
        ) : confirmation.whatsappUrl ? (
          <div className="mt-6 rounded-xl border border-border bg-white p-5">
            <p className="text-sm">
              Transmettre au gérant les articles, le total et vos coordonnées de
              test. WhatsApp s’ouvrira avec le récapitulatif : appuyez ensuite
              sur « Envoyer ». Aucun message n’est envoyé automatiquement.
            </p>
            <a
              href={confirmation.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground"
            >
              Envoyer le récapitulatif sur WhatsApp
            </a>
            <p className="mt-3 text-xs">
              La commande est déjà enregistrée. L’ouverture de WhatsApp ne
              prouve pas sa réception par le gérant.
            </p>
          </div>
        ) : (
          <p className="mt-6 text-sm">
            La commande est disponible dans l’administration. Le contact
            WhatsApp n’est pas encore configuré.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 text-red-800">
            {error}
          </p>
        )}
      </section>
    );
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
      <ol
        aria-label="Étapes de la commande"
        className="grid grid-cols-3 gap-2 text-center text-xs font-semibold lg:col-span-2"
      >
        {["Coordonnées", "Vérification", "Confirmation"].map((label, index) => (
          <li
            key={label}
            aria-current={(quote ? 1 : 0) === index ? "step" : undefined}
            className={`rounded-lg px-2 py-3 ${(quote ? 1 : 0) === index ? "bg-primary text-white" : "bg-secondary"}`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <form
        onSubmit={prepare}
        onInvalid={(event) => {
          const input = event.target;
          if (!(
            input instanceof HTMLInputElement ||
            input instanceof HTMLSelectElement ||
            input instanceof HTMLTextAreaElement
          ))
            return;
          if (input.name)
            setFieldErrors((errors) => ({
              ...errors,
              [input.name]:
                input.name === "phone"
                  ? "Saisissez un numéro fictif au format +221770000000."
                  : "Complétez ce champ en respectant le format demandé.",
            }));
        }}
        onChange={(event) => {
          const input = event.target;
          if (!(
            input instanceof HTMLInputElement ||
            input instanceof HTMLSelectElement ||
            input instanceof HTMLTextAreaElement
          ))
            return;
          setFieldErrors((errors) => ({ ...errors, [input.name]: "" }));
          if (!attempted) setQuote(null);
        }}
        className="space-y-5 rounded-2xl border border-primary/15 bg-white p-4 sm:p-6"
      >
        <fieldset
          disabled={attempted || busy || !items.length}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold">Coordonnées de test</h2>
          <p className="text-sm text-muted-foreground">
            Utilisez des coordonnées de livraison fictives. Seul le numéro
            WhatsApp de test autorisé peut être réel. Aucun achat, paiement ou
            livraison réelle. Les notifications WhatsApp activées sont
            réellement envoyées.
          </p>
          <label className="block text-sm font-semibold">
            Nom fictif
            <input
              name="name"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "error-name" : undefined}
              required
              minLength={2}
              maxLength={100}
              autoComplete="off"
              className={field}
            />
          </label>
          {fieldError("name")}
          <label className="block text-sm font-semibold">
            Téléphone fictif
            <input
              name="phone"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "error-phone" : undefined}
              type="tel"
              required
              pattern="\+2217[05678][0-9]{7}"
              placeholder="+221770000000"
              className={field}
            />
            <span className="text-xs">Format : +221 suivi de 9 chiffres.</span>
          </label>
          {fieldError("phone")}
          {customerWhatsappEnabled && (
            <fieldset className="rounded-lg border p-4 space-y-3">
              <legend className="px-1 font-semibold">
                Confirmation WhatsApp facultative
              </legend>
              <label className="block">
                Votre numéro WhatsApp de test
                <input
                  name="customerWhatsapp"
                  type="tel"
                  maxLength={40}
                  placeholder="+ indicatif et numéro"
                  className={field}
                  aria-describedby="whatsapp-test-help"
                />
              </label>
              <p id="whatsapp-test-help" className="text-xs">
                Utilisez uniquement un numéro de test vérifié auprès de la
                boutique. Aucun message promotionnel.
              </p>
              <label className="flex items-start gap-3 text-sm">
                <input
                  name="customerWhatsappConsent"
                  type="checkbox"
                  className="mt-1 size-5 shrink-0"
                />
                J’accepte de recevoir sur ce numéro, via WhatsApp (Meta), la
                confirmation de cette commande avec ses articles et son montant.
              </label>
            </fieldset>
          )}
          <h3 className="border-t border-primary/15 pt-5 text-lg font-bold">
            Livraison de démonstration
          </h3>
          <label className="block text-sm font-semibold">
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
              aria-invalid={Boolean(fieldErrors.district)}
              aria-describedby={
                fieldErrors.district ? "error-district" : undefined
              }
              required
              minLength={2}
              maxLength={100}
              className={field}
            />
          </label>
          {fieldError("district")}
          <label className="block">
            Adresse fictive
            <textarea
              name="address"
              aria-invalid={Boolean(fieldErrors.address)}
              aria-describedby={
                fieldErrors.address ? "error-address" : undefined
              }
              required
              minLength={5}
              maxLength={300}
              className={field}
            />
          </label>
          {fieldError("address")}
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
            className="w-full"
            disabled={
              busy || !items.length || !zones.length || !!placed || attempted
            }
          >
            {busy ? "Vérification en cours…" : "Vérifier le total"}
          </Button>
        </fieldset>
      </form>
      <section
        ref={summaryRef}
        tabIndex={-1}
        aria-label="Récapitulatif avant confirmation"
        className="scroll-mt-48 self-start rounded-2xl border border-primary/15 bg-secondary p-4 sm:p-6 lg:sticky lg:top-40"
        aria-live="polite"
      >
        <h2 className="text-xl font-bold">Avant de confirmer</h2>
        {!ready && (
          <p role="status" className="mt-4">
            Chargement de votre panier…
          </p>
        )}
        {ready && !items.length && (
          <p className="mt-4">
            Votre panier est vide.{" "}
            <Link href="/catalogue" className="underline">
              Découvrir les produits
            </Link>
          </p>
        )}
        {quote && (
          <>
            <ul className="mt-4 divide-y divide-primary/15 rounded-xl bg-white px-3">
              {quote.lines.map((l) => (
                <li
                  key={l.variantId}
                  className="flex justify-between gap-3 py-3 text-sm"
                >
                  <span>
                    {l.quantity} × {l.name}
                  </span>
                  <strong className="shrink-0">
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
              {busy ? busyLabel : "Confirmer la commande de test"}
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
            {busyLabel}
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
