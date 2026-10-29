"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Share2, Check, Truck } from "lucide-react";
import type { CatalogProduct } from "@/modules/catalog/types";
import { formatPrice } from "@/modules/catalog/rules";
import { addToCart } from "@/modules/cart/client";
import { MAX_CART_QUANTITY } from "@/modules/cart/rules";
import { Button } from "@/components/ui/button";

export function ProductDetails({
  product,
  whatsapp,
}: {
  product: CatalogProduct;
  whatsapp: string | null;
}) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [message, setMessage] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const variant = product.variants.find((v) => v.id === variantId)!;
  const image = product.images[imageIndex];
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({
          title: product.name,
          url: window.location.href,
        });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Lien du produit copié.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setShareMessage(
          "Partage indisponible. Copiez l’adresse de cette page.",
        );
    }
  }
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(max-width: 1023px) 90vw, 45vw"
              className="object-contain"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-muted-foreground">
              Image indisponible
            </span>
          )}
        </div>
        {product.images.length > 1 && (
          <div
            className="mt-3 flex flex-wrap gap-3"
            aria-label="Galerie du produit"
          >
            {product.images.map((img, i) => (
              <button
                key={img.src + i}
                className="relative h-16 w-16 overflow-hidden rounded-lg border border-border"
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={`Voir la photo ${i + 1}`}
                aria-pressed={imageIndex === i}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <Link
          href={`/catalogue?category=${product.category.slug}`}
          className="text-xs uppercase tracking-widest text-muted-foreground underline underline-offset-4"
        >
          {product.category.name}
        </Link>
        <h1 className="editorial mt-4 text-4xl sm:text-5xl">{product.name}</h1>
        <p className="mt-5 text-2xl font-semibold">
          {formatPrice(variant.priceXof)}
        </p>
        {product.isDemo && (
          <p className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm">
            <strong>Démonstration.</strong> Prix, variantes et stocks fictifs.
            Aucune vente réelle.
          </p>
        )}
        <p className="mt-6 leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <form
          className="mt-7 border-t border-primary/15 pt-6"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(
              addToCart(
                variant.id,
                quantity,
                variant.available,
                variant.priceXof,
              ),
            );
          }}
        >
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Modèle</legend>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <label
                  key={v.id}
                  className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm ${variantId === v.id ? "border-primary bg-secondary" : "border-border bg-white"}`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={v.id}
                    checked={variantId === v.id}
                    onChange={() => {
                      setVariantId(v.id);
                      setQuantity(1);
                      setMessage(null);
                      const index = product.images.findIndex(
                        (img) => img.src === v.image,
                      );
                      setImageIndex(index < 0 ? 0 : index);
                    }}
                    className="accent-primary"
                  />
                  {v.label}
                </label>
              ))}
            </div>
          </fieldset>
          <p
            className="mt-4 flex items-center gap-2 text-sm"
            aria-live="polite"
          >
            {variant.available > 0 ? (
              <>
                <Check size={16} aria-hidden="true" />
                {variant.available} disponible{variant.available > 1 ? "s" : ""}
                {product.isDemo ? " en démo" : ""}
              </>
            ) : (
              "Ce modèle est épuisé."
            )}
          </p>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="quantity"
                className="mb-2 block text-sm font-semibold"
              >
                Quantité
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                max={Math.min(MAX_CART_QUANTITY, variant.available) || 1}
                value={quantity}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isInteger(next)) setQuantity(next);
                }}
                required
                disabled={!variant.available}
                className="min-h-12 w-24 rounded-lg border border-border bg-white px-3"
              />
            </div>
            <Button
              type="submit"
              disabled={!variant.available}
              className="grow"
            >
              <ShoppingBag size={18} aria-hidden="true" />
              {variant.available ? "Ajouter au panier" : "Épuisé"}
            </Button>
          </div>
          {message && (
            <div className="mt-4">
              <p
                role={message.ok ? "status" : "alert"}
                className={`text-sm ${message.ok ? "text-primary" : "text-red-800"}`}
              >
                {message.message}
              </p>
              {message.ok && (
                <Link
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline"
                  href="/panier"
                >
                  Voir mon panier →
                </Link>
              )}
            </div>
          )}
        </form>
        <div className="mt-6 border-t border-primary/15 pt-5">
          <p className="flex gap-2 text-sm">
            <Truck size={18} className="shrink-0" aria-hidden="true" />
            Livraison à Dakar : zones et tarifs à confirmer avant l’ouverture.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            L’ajout au panier ne réserve pas le stock. Les commandes ne sont pas
            encore ouvertes.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-5">
          <button
            type="button"
            onClick={share}
            className="inline-flex min-h-11 items-center gap-2 text-sm underline"
          >
            <Share2 size={16} aria-hidden="true" />
            Partager ce produit
          </button>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour, je souhaite des informations sur ${product.name} (réf. ${variant.sku}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-sm underline"
            >
              Contacter sur WhatsApp
            </a>
          )}
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {shareMessage}
        </p>
      </div>
    </div>
  );
}
