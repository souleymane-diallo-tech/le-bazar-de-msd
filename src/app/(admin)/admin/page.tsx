import { redirect } from "next/navigation";
import { getActor } from "@/modules/identity/session";
import { SignOut } from "./sign-out";

export default async function AdminPage() {
  const actor = await getActor();
  if (!actor) redirect("/connexion");
  return (
    <main id="contenu" className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-sm text-muted-foreground">
            Le Bazar de MSD · Espace équipe
          </p>
          <h1 className="editorial mt-3 text-4xl">Bienvenue, {actor.name}</h1>
        </div>
        <SignOut />
      </div>
      <div className="mt-10 rounded-xl border border-border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Votre espace est prêt à évoluer
        </h2>
        <p className="mt-3 text-muted-foreground">
          La connexion sécurisée est opérationnelle. La gestion des produits, du
          stock et des commandes sera ajoutée lors des prochaines phases.
        </p>
        <p className="mt-5 text-sm">
          Rôle : {actor.roleId === "OWNER" ? "Propriétaire" : "Gestionnaire"}
        </p>
      </div>
    </main>
  );
}
