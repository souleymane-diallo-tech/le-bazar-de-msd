import { getDb } from "@/lib/db";
import { requirePermission } from "@/modules/identity/session";
import { AdminForm } from "@/components/admin/form";
import { Active, Field, Hidden } from "@/components/admin/fields";
export default async function ZonesPage() {
  await requirePermission("settings:write");
  const zones = await getDb().deliveryZone.findMany({
    where: { isDemo: true },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <h1 className="editorial text-4xl">Zones de livraison</h1>
      <p className="my-5 text-sm">
        Tarifs fictifs. Une modification s’applique uniquement aux nouvelles
        commandes. Aucun délai garanti.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {[...zones, null].map((z) => (
          <section
            key={z?.id ?? "new"}
            className="rounded-xl border border-border bg-white p-5"
          >
            <h2 className="mb-5 font-semibold">
              {z?.name ?? "Nouvelle zone fictive"}
            </h2>
            <AdminForm action="zone">
              {z && <Hidden name="id" value={z.id} />}
              <Field name="name" label="Nom de la zone" value={z?.name} />
              <Field
                name="feeXof"
                label="Frais fictifs en FCFA"
                type="number"
                value={z?.feeXof}
              />
              <Active value={z?.active} />
            </AdminForm>
          </section>
        ))}
      </div>
    </>
  );
}
