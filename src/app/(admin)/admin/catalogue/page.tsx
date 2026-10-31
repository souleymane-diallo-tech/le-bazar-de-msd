import { getDb } from "@/lib/db";
import { requirePermission } from "@/modules/identity/session";
import { AdminForm } from "@/components/admin/form";
import { Active, Field, Hidden, inputClass } from "@/components/admin/fields";
export default async function AdminCatalog() {
  await requirePermission("catalog:write");
  const db = getDb();
  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { isDemo: true },
      include: {
        variants: { include: { inventory: true }, orderBy: { sku: "asc" } },
        images: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.category.findMany({ orderBy: { name: "asc" }, take: 100 }),
  ]);
  function productFields(p?: (typeof products)[number]) {
    return (
      <>
        {p && (
          <>
            <Hidden name="id" value={p.id} />
            <Hidden name="updatedAt" value={p.updatedAt.toISOString()} />
          </>
        )}
        <Field name="name" label="Nom du produit" value={p?.name} />
        <Field
          name="slug"
          label="Adresse courte (minuscules et tirets)"
          value={p?.slug}
        />
        <label className="block text-sm">
          Description
          <textarea
            name="description"
            defaultValue={p?.description}
            maxLength={5000}
            rows={4}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          Catégorie
          <select
            name="categoryId"
            defaultValue={p?.categoryId}
            className={inputClass}
          >
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Publication
          <select
            name="status"
            defaultValue={p?.status ?? "DRAFT"}
            className={inputClass}
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </label>
        <label className="block text-sm">
          Photographie fournie
          <select
            name="image"
            defaultValue={p?.images[0]?.objectKey}
            className={inputClass}
          >
            {[
              ["distributeur", "Distributeur"],
              ["maison", "Rangements"],
              ["ventilateur", "Ventilateur"],
              ["horloge", "Horloge"],
            ].map(([key, title]) => (
              <option key={key} value={`/images/${key}.jpg`}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <Field
          name="alt"
          label="Description accessible de la photographie"
          value={p?.images[0]?.alt ?? p?.name}
        />
      </>
    );
  }
  return (
    <>
      <h1 className="editorial text-4xl">Catalogue & stock</h1>
      <p className="my-4 text-sm text-muted-foreground">
        Produits de démonstration uniquement. Médias : les quatre photographies
        fournies. Liste limitée aux 100 produits les plus récents.
      </p>
      <details className="my-6 rounded-xl border border-border bg-white p-5">
        <summary className="min-h-11 cursor-pointer font-semibold">
          Créer un produit de démonstration
        </summary>
        <AdminForm action="product" submit="Créer le brouillon">
          {productFields()}
        </AdminForm>
      </details>
      <div className="space-y-6">
        {products.map((p) => (
          <details
            key={p.id}
            className="rounded-xl border border-border bg-white p-5"
          >
            <summary className="min-h-11 cursor-pointer font-semibold">
              {p.name} ·{" "}
              {
                {
                  DRAFT: "Brouillon",
                  PUBLISHED: "Publié",
                  ARCHIVED: "Archivé",
                }[p.status]
              }{" "}
              · {p.variants.length} variante(s)
            </summary>
            <div className="mt-5 grid gap-8 lg:grid-cols-2">
              <AdminForm action="product">{productFields(p)}</AdminForm>
              <div className="space-y-6">
                <h2 className="editorial text-2xl">Variantes et inventaire</h2>
                {p.variants.map((v) => (
                  <div
                    key={v.id}
                    className="space-y-5 rounded-xl bg-secondary p-4"
                  >
                    <AdminForm action="variant">
                      <Hidden name="id" value={v.id} />
                      <Hidden name="productId" value={p.id} />
                      <Hidden
                        name="updatedAt"
                        value={v.updatedAt.toISOString()}
                      />
                      <Field name="label" label="Variante" value={v.label} />
                      <Field name="sku" label="SKU unique" value={v.sku} />
                      <Field
                        name="priceXof"
                        label="Prix fictif en FCFA"
                        type="number"
                        value={v.priceXof}
                      />
                      <Active value={v.active} />
                    </AdminForm>
                    {v.inventory && (
                      <AdminForm action="stock" submit="Ajuster le stock">
                        <Hidden name="variantId" value={v.id} />
                        <Hidden name="version" value={v.inventory.version} />
                        <p className="text-sm">
                          Réservé : {v.inventory.reserved} · Disponible :{" "}
                          {v.inventory.onHand - v.inventory.reserved}
                        </p>
                        <Field
                          name="onHand"
                          label="Stock physique total"
                          type="number"
                          value={v.inventory.onHand}
                        />
                        <Field name="reason" label="Motif de l’ajustement" />
                      </AdminForm>
                    )}
                  </div>
                ))}
                <details>
                  <summary className="min-h-11 cursor-pointer underline">
                    Ajouter une variante
                  </summary>
                  <AdminForm action="variant">
                    <Hidden name="productId" value={p.id} />
                    <Field name="label" label="Libellé" />
                    <Field name="sku" label="Nouveau SKU unique" />
                    <Field
                      name="priceXof"
                      label="Prix fictif en FCFA"
                      type="number"
                    />
                    <Active />
                  </AdminForm>
                </details>
              </div>
            </div>
          </details>
        ))}
      </div>
      <h2 className="editorial mb-5 mt-10 text-3xl">Catégories</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {[...categories, null].map((c) => (
          <div
            key={c?.id ?? "new"}
            className="rounded-xl border border-border bg-white p-5"
          >
            <h3 className="mb-4 font-semibold">
              {c?.name ?? "Nouvelle catégorie"}
            </h3>
            <AdminForm action="category">
              {c && <Hidden name="id" value={c.id} />}
              <Field name="name" label="Nom de la catégorie" value={c?.name} />
              <Field name="slug" label="Identifiant court" value={c?.slug} />
              <Active value={c?.active} />
            </AdminForm>
          </div>
        ))}
      </div>
    </>
  );
}
