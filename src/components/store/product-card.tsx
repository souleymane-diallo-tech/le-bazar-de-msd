import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { CatalogProduct } from "@/modules/catalog/types";
import { formatPrice, minPrice } from "@/modules/catalog/rules";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.images[0];
  const available = product.variants.some((v) => v.available > 0);
  return (
    <article className="group min-w-0">
      <Link
        href={`/produits/${product.slug}`}
        className="block rounded-xl"
        aria-label={`Découvrir ${product.name}`}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon size={40} aria-label="Image indisponible" />
            </div>
          )}
          <span className="absolute bottom-3 right-3 rounded-full bg-white p-2 text-primary">
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
          {product.isDemo && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold">
              Démo
            </span>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {product.category.name}
        </p>
        <h2 className="mt-1 text-base font-semibold group-hover:underline group-hover:underline-offset-4">
          {product.name}
        </h2>
      </Link>
      <div className="mt-2 flex flex-wrap justify-between gap-2">
        <p className="text-sm font-bold">
          {product.variants.some((v) => v.priceXof !== minPrice(product))
            ? "Dès "
            : ""}
          {formatPrice(minPrice(product))}
        </p>
        <span className="text-xs text-muted-foreground">
          {available ? "Disponible" : "Épuisé"}
          {product.isDemo ? " · démo" : ""}
        </span>
      </div>
    </article>
  );
}
