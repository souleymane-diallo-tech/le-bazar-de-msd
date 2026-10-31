import { redirect } from "next/navigation";
import { getActor } from "@/modules/identity/session";
import Link from "next/link";

export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getActor();
  if (!actor) redirect("/connexion");
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-10">
      <nav
        aria-label="Administration"
        className="mb-8 flex flex-wrap gap-x-6 border-b border-border pb-4 text-sm"
      >
        {[
          ["/admin", "Tableau de bord"],
          ["/admin/catalogue", "Catalogue & stock"],
          ["/admin/commandes", "Commandes"],
          ...(actor.roleId === "OWNER"
            ? [["/admin/livraison", "Livraison"]]
            : []),
          ["/catalogue", "Voir la boutique"],
        ].map(([href, title]) => (
          <Link
            key={href}
            href={href}
            className="inline-flex min-h-11 items-center underline"
          >
            {title}
          </Link>
        ))}
      </nav>
      <main id="contenu">{children}</main>
    </div>
  );
}
