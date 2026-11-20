export const metadata = {
  title: "À propos de cette démonstration",
  robots: { index: false, follow: false },
};
export default function DemoPage() {
  return (
    <main
      id="contenu"
      className="mx-auto max-w-3xl space-y-7 px-5 py-12 sm:px-10"
    >
      <h1 className="editorial text-4xl">À propos de cette démonstration</h1>
      <section>
        <h2 className="text-xl font-semibold">
          Un parcours pour essayer la boutique
        </h2>
        <p className="mt-3">
          Les prix, stocks, zones et commandes sont fictifs. Aucun paiement
          mobile, encaissement ou envoi réel n’est effectué. Utilisez uniquement
          des coordonnées fictives dans le checkout.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Ce que le navigateur conserve</h2>
        <p className="mt-3">
          Le panier est conservé sur cet appareil. L’onglet garde temporairement
          la demande de test pour reprendre un envoi interrompu, puis un jeton
          permettant de retrouver sa confirmation. L’administration utilise une
          session de connexion. Les commandes de test et leurs opérations sont
          enregistrées dans la base de démonstration.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Aucun suivi publicitaire</h2>
        <p className="mt-3">
          Aucun pixel publicitaire ou outil de statistiques tiers n’est
          installé. Les liens WhatsApp et sociaux ouvrent le service concerné
          uniquement lorsque vous les utilisez. Aucun message n’est envoyé
          automatiquement.
        </p>
      </section>
      <p className="text-sm text-muted-foreground">
        Les informations commerciales et les documents applicables à une
        boutique ouverte seront finalisés avant le lancement.
      </p>
    </main>
  );
}
