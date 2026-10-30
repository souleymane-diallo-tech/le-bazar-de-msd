# Backlog prêt à décliner en Issues

Estimation relative : S = petit incrément, M = plusieurs tâches, L = épique à découper. Ces tailles ne sont pas des engagements de jours. État actualisé ci-dessous.

## Avancement au 29 octobre 2026

- B01 : conception validée. B02 : versions et authentification choisies ; fournisseurs distants en attente.
- B03/B04 : dépôt et CI opérationnels, migrations PostgreSQL testées. Dépôt rendu public provisoirement par l'utilisateur.
- B05 : sessions/permissions testées ; récupération de compte et MFA à finaliser avant production.
- B06 : démonstration Vercel encore non déployée.
- B07 : composants et responsive vérifiés ; audit WCAG complet réservé à la recette consolidée.
- B08 : CRUD administrateur et uploads non commencés, prévus avec l'administration en Phase 4.
- B09 : catalogue, fiches, variantes, recherche, filtre, tri et pagination implémentés sur données de démo. Dépendance B08 remplacée pour la recette par le schéma et un seed explicitement autorisé (ADR 005).
- B10 : panier persistant, quantité/suppression, devis serveur, alertes de prix/stock implémentés. Livraison non chiffrée tant que zones et tarifs non fournis ; checkout non activé.
- B16 : partage et métadonnées produit prêts ; WhatsApp conditionné à un vrai contact. SEO de production et sitemap restent dans la phase marketing.
- B11–B15, B17–B22 : non commencés ; phases suivantes soumises à validation.

| ID  | Priorité / taille | Travail                                            | Dépendances           | Acceptation                                                           |
| --- | ----------------- | -------------------------------------------------- | --------------------- | --------------------------------------------------------------------- |
| B01 | P0 S              | Valider décisions de Phase 1                       | —                     | Hypothèses majeures approuvées ou report explicitement accepté        |
| B02 | P0 M              | Comparer fournisseurs/auth et verrouiller versions | B01                   | Coûts, région, restauration et compatibilité documentés               |
| B03 | P0 M              | Dépôt privé et CI                                  | B02                   | PR, contrôles automatiques, aucun secret                              |
| B04 | P0 M              | Schéma et migrations                               | B02                   | Contraintes et migration testées sur base isolée                      |
| B05 | P0 M              | Sessions et permissions                            | B03,B04               | Matrice d'accès testée, récupération compte définie                   |
| B06 | P0 S              | Première démo Vercel                               | B03,B04               | URL protégée, aucune donnée/clé de production                         |
| B07 | P0 M              | Tokens et composants UI                            | B01,B03               | États, clavier et contrastes vérifiés                                 |
| B08 | P0 L              | Catalogue admin et médias                          | B04,B05,B07           | Création/édition/publication/archivage utilisables                    |
| B09 | P0 M              | Catalogue public et fiche                          | B08                   | Recherche, catégorie, tri, pagination, variantes                      |
| B10 | P0 M              | Panier et devis                                    | B09                   | Quantités et total serveur, changements de prix signalés              |
| B11 | P0 L              | Commande et réservation                            | B04,B10               | T02 à T08 passent ; aucun état partiel                                |
| B12 | P0 M              | Checkout invité                                    | B07,B11               | Commande complète au clavier et sur smartphone                        |
| B13 | P0 L              | Administration commandes et stock                  | B05,B11               | Transitions, annulation, expédition et audit                          |
| B14 | P0 M              | Zones, livraison et collecte                       | B12,B13               | Frais snapshot, livraison/encaissement distincts                      |
| B15 | P0 M              | Dashboard et clients                               | B13,B14               | Indicateurs calculés correctement, aucune exposition publique         |
| B16 | P1 M              | WhatsApp, partage et SEO                           | B09, contacts fournis | Liens réels, metadata, sitemap et canonical                           |
| B17 | P1 L              | Adaptateur Wave                                    | B11, accès Wave       | Signature, déduplication, rapprochement et anomalies testés           |
| B18 | P1 L              | Adaptateur Orange Money                            | B11, accès OM         | Même critères, selon contrat/API applicable                           |
| B19 | P2 M              | Consentement et pixels / flux Meta                 | Accès marketing, B16  | Aucun tracking avant accord ; retrait possible                        |
| B20 | P0 L              | Recette consolidée                                 | B08–B16               | Matrice critique passante, défauts bloquants résolus                  |
| B21 | P0 M              | Exploitation et formation                          | B20                   | Restauration testée, guide commerçant, propriétaire des accès désigné |
| B22 | P0 M              | Production et recette finale                       | B21, accord explicite | Smoke tests, suivi erreurs et transfert validés                       |

## Format d'Issue

Contexte, résultat attendu, périmètre/exclusions, dépendances, critères d'acceptation observables, tests requis, risque de migration/sécurité, taille, responsable et liens ADR. Aucun agent parallèle avant stabilisation des contrats et du schéma.

Actualisation du 30 octobre 2026 : B04 dispose désormais d’une base Neon Free de démo migrée et initialisée ; B06 reste partiel (projet/variables/protection prêts, aucun déploiement, offre d’hébergement et APP_URL à résoudre). Voir ADR 006.
