# Backlog prêt à décliner en Issues

22 novembre : suivi WhatsApp déployé en simulation, migration Neon appliquée après sauvegarde, webhook Meta configuré et abonnement du compte vérifié. Une commande distante a traversé Vercel Queues sans doublon, puis a été annulée avec restitution du stock. Tests locaux : 43 unitaires, 27 PostgreSQL et 22 navigateur passants ; CI réussie, PR #5. Restent approbation Meta du modèle français (PENDING), recette de livraison réelle, déclenchement planifié et token durable avant activation continue. Token de test renouvelé en secret Preview, à charger au prochain déploiement. Voir ADR 012 et status.md.

Stockage durable : proposition Vercel Blob privé, adaptateur et script de transfert préparés, activation distante et recette avant bascule encore à effectuer. Procédure dans `docs/deployment-preparation.md`, ADR 011.

Photos, 19 novembre : import local de la photo principale et miniatures réalisés, formats et dimensions contrôlés. Stockage durable distant et transfert des fichiers requis avant déploiement de cet incrément. WhatsApp remplaçable dans les paramètres existants. ADR 010.

Itération du 19 novembre 2026 : accès propriétaire temporaire, recherche/pagination catalogue, recette CRUD et commande vers WhatsApp par bouton client réalisés et vérifiés localement. Voir ADR 009 et status.md ; lancement commercial toujours distinct.

Estimation relative : S = petit incrément, M = plusieurs tâches, L = épique à découper. Ces tailles ne sont pas des engagements de jours. État actualisé ci-dessous.

## Avancement courant au 31 octobre 2026

- B16 : SEO technique préparé, canonical et partage propres, paramètres WhatsApp/socials sécurisés, numéro de test configuré seulement en local ; indexation désactivée pour la démo. Recette phase 5 réussie : 72 tests, build/types/lint/format ; 15 répétitions supplémentaires de visibilité/contact. Aucun déploiement Phase 5.
- B17/B18 : explicitement reportés, aucun accès marchand mobile disponible selon l’utilisateur. Aucun adaptateur/webhook ni test prestataire revendiqué. Reprise décrite dans `docs/payments-readiness.md`.
- B19 : pixels et flux Meta non retenus dans cet incrément faute de comptes/configuration validés ; aucun tracking chargé. Simples liens sociaux prêts, vides par défaut.
- B20–B22 : phases 6–7 non engagées. Aucune nouvelle mise en ligne effectuée.

- B06 : Phase 3 accessible publiquement sur l’alias Vercel de démo ; aucun déploiement Phase 4 effectué.
- B08 : administration catalogue, catégories, variantes, publication/archivage, ajustement de stock et sélection des photos existantes implémentés. L’utilisateur conserve les quatre photos pour cette démo ; nouvel upload/stockage explicitement hors de cet incrément.
- B11/B12 : checkout fictif, devis signé, confirmation privée, idempotence, réservations SERIALIZABLE et reprise réseau implémentés. Aucun checkout commercial activé.
- B13/B14 : transitions de commandes, annulation, expédition, retour physique, zones et snapshots, correction d’adresse, collecte/remboursement simulés et audit implémentés.
- B15 : dashboard démo, collecte nette, liste des derniers clients distincts et audit propriétaire implémentés.
- Recette de phase 4 réussie : 60 tests (20 unitaires, 22 PostgreSQL, 18 navigateur), plus cinq répétitions des trois scénarios checkout. Build/types/lint/format passants. Incrément dans la PR #3 ; pas de déploiement Phase 4.
- Avant exploitation réelle : tâche d’expiration planifiée, paramètres commerciaux, médias supplémentaires si demandés, compte permanent et récupération/MFA, validation globale. B17–B22 ne sont pas engagés par cet incrément.

Les sections datées ci-dessous constituent l’historique et ne remplacent pas cet état courant.

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

B06 — 30 octobre 2026 : boutique Preview désormais READY sur https://le-bazar-de-msd-demo.vercel.app ; smoke tests HTTP et panier réalisés. Recette de connexion administrateur distante restante. Production contient uniquement une page d’attente protégée autorisée.

B06 : accès public temporaire demandé et vérifié sans session Vercel le 30 octobre ; authentification administrateur préservée.

- [x] Connecter le Blob privé à Preview et préparer Neon après sauvegarde (20 novembre).
- [x] Valider le déploiement distant avec import réel Blob avant publication de l’alias (20 novembre).
