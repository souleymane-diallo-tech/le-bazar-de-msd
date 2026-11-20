import { getPublicSettings } from "@/modules/settings/read";
import { whatsappLink } from "@/modules/settings/rules";
import { pageMetadata } from "@/modules/seo/metadata";
export const dynamic = "force-dynamic";
export function generateMetadata() {
  return pageMetadata(
    "Nous contacter",
    "Retrouvez les coordonnées et les liens officiels configurés pour Le Bazar de MSD.",
    "/contact",
  );
}
export default async function ContactPage() {
  const settings = await getPublicSettings();
  const link = whatsappLink(
    settings.whatsapp,
    "Bonjour, je souhaite des informations sur Le Bazar de MSD.",
  );
  const socials = [
    ["Facebook", settings.facebook],
    ["Instagram", settings.instagram],
    ["TikTok", settings.tiktok],
  ].filter(([, url]) => url);
  return (
    <main id="contenu" className="mx-auto max-w-4xl px-5 py-12 sm:px-10">
      <p className="text-sm text-muted-foreground">Le Bazar de MSD</p>
      <h1 className="editorial mt-3 text-4xl sm:text-5xl">
        Parlons de vos envies.
      </h1>
      <p className="mt-5 max-w-xl text-muted-foreground">
        Une question sur un objet ou sur la boutique ? Retrouvez ici les moyens
        de contact disponibles.
      </p>
      <section className="mt-8 rounded-2xl bg-secondary p-6 sm:p-9">
        <h2 className="editorial text-2xl">Nous écrire sur WhatsApp</h2>
        {link ? (
          <>
            <p className="mt-4">+{settings.whatsapp}</p>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-primary px-5 py-3 text-white"
            >
              Ouvrir WhatsApp
            </a>
            <p className="mt-4 text-xs text-muted-foreground">
              WhatsApp s’ouvrira avec un message préparé. Rien n’est envoyé
              automatiquement.
            </p>
          </>
        ) : (
          <p className="mt-4">
            Les coordonnées de la boutique seront ajoutées avant son ouverture.
          </p>
        )}
      </section>
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 className="editorial text-2xl">Retrouvez-nous aussi</h2>
          <div className="mt-4 flex flex-wrap gap-6">
            {socials.map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline"
              >
                {name}
              </a>
            ))}
          </div>
        </section>
      )}
      <p className="mt-8 text-sm text-muted-foreground">
        Cette version est une démonstration : produits, prix et conditions de
        livraison ne constituent pas une offre commerciale.
      </p>
    </main>
  );
}
