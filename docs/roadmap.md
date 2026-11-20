# Plan de livraison

## Itération autorisée le 19 novembre 2026

Recette fonctionnelle de l’administration, accès temporaire, gestion du catalogue et parcours client jusqu’à la commande/transmission WhatsApp. Bouton d’envoi validé par le client explicitement retenu, sans prestataire supplémentaire. Périmètre local de démonstration ; ne vaut pas lancement commercial ni accord sur les autres travaux de phase 7. Voir ADR 009.

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

## Actualisation du 31 octobre 2026

Phase 5 autorisée après revue de la livraison Phase 4. Numéro WhatsApp Business de test fourni pour configuration locale, à remplacer ensuite par le numéro client. L’utilisateur confirme l’absence d’accès aux paiements mobiles : Wave/Orange Money sont explicitement reportés conformément au livrable « intégrations vérifiées ou reportées ». SEO préparé sans indexer la démo ; aucun pixel ni compte social inventé. Branche `features/phase-5-discovery`, voir ADR 008. Les phases 6–7 ne sont pas engagées.

## Actualisation du 30 octobre 2026

L’utilisateur autorise le démarrage de la Phase 4 après la mise en ligne publique de la Phase 3. Zones/tarifs fictifs et expiration des commandes non confirmées après 24 heures sont validés pour la démonstration seulement. Développement isolé sur `features/phase-4-orders`, aucun paiement réel ni abonnement payant. Voir ADR 007 et le suivi de recette dans `docs/status.md`.

## Actualisation du 29 octobre 2026

L’utilisateur autorise la Phase 3 locale et les données de démonstration, avec dépôt GitHub public provisoire. La Preview distante de Phase 2 reste à réaliser ; elle ne bloque plus ce développement local. Le passage en Phase 4 reste soumis à validation. Voir ADR 005.
