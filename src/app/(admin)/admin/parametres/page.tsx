import { requirePermission } from "@/modules/identity/session";
import { getPublicSettings } from "@/modules/settings/read";
import { indexingAllowed } from "@/modules/seo/rules";
import { whatsappLink } from "@/modules/settings/rules";
import { AdminForm } from "@/components/admin/form";
import { Field, Hidden } from "@/components/admin/fields";
export default async function SettingsPage() {
  await requirePermission("settings:write");
  const settings = await getPublicSettings();
  const whatsapp = whatsappLink(
    settings.whatsapp,
    "Bonjour, je teste la démonstration du Bazar de MSD.",
  );
  return (
    <>
      <p className="text-sm text-muted-foreground">Réservé au propriétaire</p>
      <h1 className="editorial mb-8 mt-3 text-4xl">Contacts & visibilité</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-5 sm:p-8">
          <h2 className="editorial mb-4 text-2xl">Coordonnées publiques</h2>
          <p className="mb-6 text-sm">
            Les coordonnées enregistrées apparaissent sur la boutique. Vous
            pourrez remplacer le numéro de test par celui du client. Laissez un
            champ vide pour masquer son lien.
          </p>
          <AdminForm
            action="public-settings"
            submit="Enregistrer les contacts publics"
          >
            <Hidden name="version" value={settings.version} />
            <Field
              name="whatsapp"
              label="WhatsApp Business (format international)"
              value={settings.whatsapp}
              required={false}
              type="tel"
            />
            <Field
              name="facebook"
              label="Profil Facebook — URL HTTPS"
              value={settings.facebook}
              required={false}
              type="url"
            />
            <Field
              name="instagram"
              label="Profil Instagram — URL HTTPS"
              value={settings.instagram}
              required={false}
              type="url"
            />
            <Field
              name="tiktok"
              label="Profil TikTok — URL HTTPS"
              value={settings.tiktok}
              required={false}
              type="url"
            />
          </AdminForm>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center underline"
            >
              Ouvrir le lien WhatsApp configuré
            </a>
          )}
        </section>
        <section className="self-start rounded-2xl bg-secondary p-5 sm:p-8">
          <h2 className="editorial text-2xl">État des intégrations</h2>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="font-semibold">Moteurs de recherche</dt>
              <dd className="mt-1 text-sm">
                {indexingAllowed(process.env)
                  ? "Indexation autorisée pour les pages publiques."
                  : "Indexation désactivée. La démonstration reste exclue du référencement demandé aux moteurs."}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Wave et Orange Money</dt>
              <dd className="mt-1 text-sm">
                Reportés : accès marchands et essais prestataires non
                disponibles. Aucun paiement mobile proposé.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Publicité et statistiques</dt>
              <dd className="mt-1 text-sm">
                Aucun pixel ni traceur publicitaire installé. Les liens sociaux
                sont de simples liens, sans chargement de widgets externes.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Commande de démonstration</dt>
              <dd className="mt-1 text-sm">
                Le paiement à la livraison simulé reste le seul parcours
                disponible quand le checkout de test est activé.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}
