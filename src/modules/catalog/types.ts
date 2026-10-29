export type CatalogVariant = {
  id: string;
  label: string;
  sku: string;
  priceXof: number;
  available: number;
  image: string | null;
};
export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  isDemo: boolean;
  category: { name: string; slug: string };
  images: { src: string; alt: string }[];
  variants: CatalogVariant[];
  createdAt: string;
};
export type CatalogQuery = {
  q: string;
  category: string;
  sort: "recent" | "price-asc" | "price-desc";
  page: number;
};
