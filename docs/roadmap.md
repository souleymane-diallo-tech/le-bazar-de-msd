# Plan de livraison

Calendrier relatif proposé, non engagement de date : budget exact, jours calendaires/ouvrés et disponibilité à confirmer. Chaque phase nécessite revue et accord de passage.

| Phase      | Objectif, périmètre et tâches                          | Dépendances                            | Livrable / acceptation                            | Tests                                         | Risque / condition de passage                                |
| ---------- | ------------------------------------------------------ | -------------------------------------- | ------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| 0 · J1–2   | Discovery, MVP, questions, responsabilités             | Décideur                               | Cadrage présenté                                  | Revue besoins                                 | Périmètre flou ; accord de conception reçu                   |
| 1 · J3–5   | Architecture, données, flux, sécurité, design, backlog | Cadrage                                | Dossier et maquettes approuvés                    | Cohérence documentaire, scénarios métier      | Hypothèses ouvertes ; validation des décisions avant socle   |
| 2 · J6–8   | Dépôt privé, Next.js, DB, auth, CI, Vercel             | Phase 1 validée, accès, versions/coûts | Socle déployé en démo                             | Lint/types/build, migration, permissions      | Accès fournisseur ; URL fonctionnelle avant catalogue        |
| 3 · J9–13  | Catalogue, images, recherche, fiches et panier         | Socle, catalogue fourni                | Boutique navigable                                | UI cinq largeurs, clavier, panier             | Contenu absent ; parcours validé                             |
| 4 · J14–20 | Checkout, stock, administration, commandes/livraison   | Services/catalogue                     | Vente à la livraison complète                     | Transactions, concurrence, idempotence, accès | Complexité stock ; tests critiques passants                  |
| 5 · J21–23 | Paiements prêts, SEO, WhatsApp, marketing retenu       | Accès marchands et sociaux             | Intégrations vérifiées ou explicitement reportées | Webhooks, consentement, liens                 | Délais prestataires ; ne pas bloquer paiement à la livraison |
| 6 · J24–27 | Recette, sécurité, responsive, performance             | MVP assemblé                           | Version candidate sans défaut bloquant            | Matrice de recette et restauration            | Défauts tardifs ; accord de production requis                |
| 7 · J28–30 | Migration, lancement, formation, transfert             | Recette et validation                  | Version livrée, responsabilités transférées       | Smoke tests et repli                          | Configuration ; recette post-déploiement                     |

La QA accompagne chaque incrément. Tout glissement sur le chemin critique déclenche révision de périmètre, jamais suppression silencieuse des tests. Les intégrations indisponibles sont différées.
