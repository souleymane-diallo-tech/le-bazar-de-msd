# Suivi — 22 novembre 2026

## Notifications WhatsApp automatiques — en préparation

- Branche `features/whatsapp-order-notifications` : outbox transactionnelle, worker Vercel Queues, reprise planifiée, webhook signé, suivi et relance propriétaire. Les résultats ambigus ne sont pas renvoyés automatiquement.
- Meta : application de démonstration créée dans le portefeuille autorisé ; compte et destinataire de test vérifiés, token temporaire enregistré en secret Preview. Le projet n’étant pas lié à Git, Vercel refuse la restriction des variables par branche ; la variable est limitée à Preview et l’envoi reste désactivé.
- Modèle français `msd_order_created` soumis en catégorie UTILITY, en attente de validation au moment de cette note. Clé de signature et jeton de vérification configurés comme secrets Preview après réauthentification utilisateur.
- Vérification locale : lint réussi, 43 tests unitaires, 27 PostgreSQL et 22 navigateur passants, incluant administration WhatsApp aux cinq largeurs et clavier. Audit production : zéro vulnérabilité signalée. Build final Webpack et TypeScript réussis après protection supplémentaire des journaux de worker (Turbopack Windows a rencontré une erreur interne CSS).
- Sauvegarde Neon vérifiée (67 331 octets), migration additive appliquée ; mode distant configuré en simulation pour la recette. Aucun envoi automatique réel ni déploiement de cet incrément revendiqué. La boutique publique conserve la version du 20 novembre jusqu’à recette. Aucun abonnement ni paiement activé.

## Activation distante du 20 novembre 2026

- Autorisation explicite : créer/connecter le stockage privé et déployer la démonstration, sans coût.
- Blob privé `msd-demo-product-images` créé en fra1 et connecté uniquement à Preview par OIDC ; variables de stockage, checkout démo et noindex configurées.
- Neon sauvegardé dans une archive locale ignorée (63 132 octets, inventaire pg_restore lisible). Deux migrations additives appliquées ; seeds idempotents et zones fictives initialisés.
- Compte propriétaire distant créé pour sept jours ; expiration le 27 novembre 2026 à 08:54 UTC, identifiants dans `.local/acces-admin-vercel.md`. Contact WhatsApp autorisé enregistré en base distante, hors Git.
- Déploiement Preview READY `dpl_E2KRQGBDKSJKwszS9gZSrAk2TU1v`, commit `ddfafde4c11578568d8620025233fbaf5dbbd45c`. Alias public basculé après recette ; PR brouillon #4, main inchangée, CI du push réussie.
- Recette HTTP distante réussie : connexion propriétaire, import Blob réel et décodage WebP (1080 px), refus anonyme du brouillon, lecture après publication, refus après archivage. Commande fictive créée, récapitulatif WhatsApp vérifié sans envoi, commande annulée et stock intégralement restitué. Produit technique conservé archivé.
- Lien final vérifié : accueil, catalogue, contact, santé et robots HTTP 200 ; quatre produits visibles dans le navigateur sans authentification Vercel. Administration anonyme refusée, session de recette fermée. Identifiants uniquement dans le fichier local ignoré.

## Préparation du stockage durable et du déploiement (historique du 19 novembre)

- Proposition : Vercel Blob privé, connexion Preview uniquement. Adaptateur serveur préparé et références d’images conservées. Aucun store créé, variable distante modifiée ou coût engagé.
- Projet/équipe/dernière Preview READY vérifiés via connecteur. Région `fra1` dans `vercel.json`, exclusion explicite des secrets et fichiers privés du paquet Vercel.
- Inventaire sans effet exécuté : quatre photos versionnées, zéro import référencé, aucun fichier à transférer actuellement. Les images des tests ne seront pas copiées.
- Plan de migration additive, accès administrateur distant distinct, configuration WhatsApp, tests et repli détaillés dans `docs/deployment-preparation.md`. Pas de mise en ligne de cette version. ADR 011.
- Préparation vérifiée : build/TypeScript, lint/format, **83 tests locaux réussis (37 unitaires, 24 PostgreSQL, 22 navigateur)**. Adaptateur Blob vérifié avec SDK simulé, pas avec un store distant. `npm audit --omit=dev` : zéro avis ; neuf avis modérés des outils de développement demeurent. Aucun secret ni numéro fourni trouvé dans les fichiers suivis ou non ignorés.

## Itération photographies de produits

- Import autorisé à la création et modification : photo principale JPEG/PNG/WebP, 3 Mo et 20 mégapixels maximum, décodage puis normalisation WebP. Miniatures dans le catalogue administrateur ; maintien des quatre photos initiales disponibles.
- Fichiers dans `.local/product-images/`, hors Git. Accès public seulement aux photos référencées par un produit publié actif ; brouillons accessibles aux administrateurs. Stockage distant à configurer avant déploiement, import désactivé sur Vercel. Voir ADR 010.
- Numéro WhatsApp fourni conservé en base locale ; remplacement possible dans Contacts & visibilité. Aucun numéro ajouté au code ni au dépôt.
- Build et TypeScript réussis, lint/format validés, 33 tests unitaires passants. Parcours navigateur : faux fichier rejeté, import valide, image décodée dans la fiche publique, remplacement, conservation de la sélection et refus public après archivage réussis. Aucun envoi WhatsApp ni déploiement.
- Stabilité : cinq répétitions du parcours d’import réussies. Miniatures des quatre produits existants décodées ; administration vérifiée à 320/375/390/768/1440 px, capture mobile inspectée. Numéro WhatsApp fourni confirmé en base via la page Contact, sans divulgation dans les sorties. Serveur local redémarré avec cet incrément.

## Itération administration et commande WhatsApp

- Autorisation : accès temporaire, gestion de la boutique et recette par itérations. Bouton WhatsApp validé par le client retenu, sans service supplémentaire.
- Compte propriétaire local créé pour sept jours ; identifiants uniquement dans `.local/acces-admin-temporaire.md`. Migration `202611190001_temporary_admin` appliquée aux bases locales dev/test. Expiration contrôlée à chaque accès et autorisation transactionnelle.
- Administration : raccourcis, recherche et pagination des produits ; gestion existante des produits, variantes, prix, stocks, catégories, zones et commandes conservée. Archivage sans effacer les commandes. Quatre photos fournies conservées.
- Commande : récapitulatif WhatsApp construit sur les snapshots, accessible avec le jeton privé seulement. Articles/SKU, total, livraison et coordonnées inclus ; aucun jeton dans le lien. Envoi manuel requis, aucune réception ni paiement déclaré automatiquement.
- Vérification : 30 tests unitaires et 24 PostgreSQL réussis. 21 scénarios navigateur passés initialement, puis les quatre scénarios checkout/admin passés après correction d’un sélecteur de test : 22 scénarios distincts couverts. Build Next.js 16.4.6 réussi. Contrôles complémentaires consignés ci-dessous.
- Correctif Next.js 16.4.3 → 16.4.6, plugin ESLint aligné ; audit d’exécution sans avis restant. Neuf avis modérés des outils de développement restent hors de cet incrément. Voir ADR 009.
- Aucun push, PR, déploiement, migration Neon ou compte distant. Vercel reste sur la phase 3. Paiements et ventes réelles désactivés. Travaux Phase 5 précédents conservés sur `features/phase-5-discovery`.
- Contrôles finaux : les deux scénarios critiques admin/checkout ont passé cinq répétitions chacun (10 exécutions). Types, lint, format et diff vérifiés. Connexion avec le compte temporaire vérifiée ; tableau de bord aux cinq largeurs, capture mobile inspectée ; numéro local WhatsApp confirmé sans affichage ni envoi. Serveur lancé sur la boucle locale, `http://localhost:3000`. Expiration du compte le 26 novembre 2026 à 18:24:49 UTC.

## Historique : phase 5 prête pour revue le 31 octobre

- Autorisée le 31 octobre : SEO, WhatsApp et réglages publics ; paiements mobiles explicitement reportés faute d’accès. Numéro Business de test fourni, enregistré uniquement dans la base locale et jamais dans Git. Aucun message envoyé.
- Branche `features/phase-5-discovery`, empilée sur la phase 4. `main`, Vercel et Neon inchangés ; aucune migration ni dépendance ajoutée.
- Implémenté : contacts publics modifiables par propriétaire avec version/audit, liens WhatsApp contextualisés, page Contact et informations de démonstration, liens sociaux facultatifs, canonical/Open Graph/cartes sociales, robots/sitemap et JSON-LD préparés avec verrou d’indexation.
- Protection : `SEO_INDEXING=disabled` par défaut, activation interdite hors production ou en Preview ; démo noindex, sitemap vide, aucun JSON-LD commercial fictif. Aucun pixel, widget ou appel à un service publicitaire.
- Vérifié : build/types/lint/format réussis ; **72 tests passants : 27 unitaires, 24 PostgreSQL, 21 Playwright**. Les trois scénarios de visibilité/contact ont réussi cinq répétitions chacun (15 exécutions supplémentaires). Contrôle des liens sans ouverture de WhatsApp, aucun appel publicitaire détecté, captures Contact inspectées à 390/1440 px ; Contact/informations/réglages aux cinq largeurs prévues.
- Paiements : aucun adaptateur Wave/Orange Money déclaré opérationnel. `PAYMENT_MODE=disabled` conservé, COD simulé uniquement. Voir `docs/payments-readiness.md` et ADR 008 pour les prérequis de reprise.
- Les limites de phase 4 restent applicables : pas de compte administrateur permanent ni cron de fond, pas de ventes réelles. Site public toujours sur la phase 3. Les phases 6–7 attendent autorisation.

## Phase 4 — état livré avant l’autorisation de phase 5

- Autorisation : phase 4, livraison fictive et expiration à 24 h validées ; maintien des quatre photos confirmé le 31 octobre. Aucun abonnement ni import de médias supplémentaire.
- Branche : `features/phase-4-orders`, issue de `feat/phase-3-storefront`. `main` inchangée, PR précédentes non fusionnées.
- Implémenté : checkout invité de démonstration, devis signé/reconfirmation, idempotence et accès privé à la confirmation ; réservations transactionnelles ; administration catalogue/variantes/stock, zones, commandes, corrections d’adresse, collecte et remboursements fictifs ; dashboard et audit.
- Garde-fous : `CHECKOUT_MODE=disabled` par défaut, `demo` interdit en production ; services limités aux données fictives ; aucune vente réelle ni paiement électronique. Import de photos hors périmètre de cette démo à la demande utilisateur.
- Données : migration additive `202610300001_demo_orders` appliquée seulement aux bases locales de développement et test. Zones fictives locales : 1 500 / 2 500 XOF. Base Neon et variables Vercel non modifiées.
- Vérifié : build final réussi, TypeScript, lint, format et `git diff --check` ; **60 tests passants : 20 unitaires, 22 PostgreSQL, 18 Playwright**. Les trois scénarios checkout ont aussi réussi cinq répétitions chacun (15 exécutions). Recette aux largeurs 320/375/390/768/1440, parcours checkout clavier et inspection des captures mobile. Aucun audit WCAG complet revendiqué.
- Corrections de recette : attente explicite de réponse/navigation lors de la connexion à froid ; isolation des compteurs de tentatives entre exécutions E2E dans la seule base locale, sans désactiver le limiteur applicatif. Première reconstruction Turbopack bloquée par son cache/processus CSS, puis builds réussis après nettoyage du seul dossier `.next`.
- Site public : https://le-bazar-de-msd-demo.vercel.app reste sur la Phase 3 précédemment déployée, commandes désactivées. Cet incrément local n’est pas une mise en ligne ni une activation commerciale.
- Limites : expiration opportuniste/bouton admin, pas de tâche planifiée hors trafic ; aucun compte permanent provisionné ; médias limités aux quatre photos ; paramètres commerciaux réels, récupération/MFA et recette de lancement restent à finaliser.
- Guide : `docs/admin-demo.md`. Décisions : ADR 007. Phase 4 publiée dans la PR #3, contrôles GitHub de la version applicative 2a2e31a réussis.

## Historique de la préparation et du déploiement de phase 3

- État au 30 octobre avant autorisation de phase 4 : boutique de démonstration prête pour revue.
- Autorisé : phases 1–3, comptes personnels GitHub/Vercel, dépôt public provisoire, catalogue fictif signalé. Neon Free et ses conditions explicitement acceptés ; stockage des secrets dédiés dans Preview autorisé. L’utilisateur maintient la préparation sans coût.
- Application : accueil, recherche/filtres/tri/pagination, fiches et variantes, panier persistant avec prix et disponibilité calculés côté serveur. Aucune commande ni paiement activé.
- Git : feat/phase-3-storefront, PR #2 empilée sur la PR #1 ; main inchangée. Version applicative 3cef825.
- Vérification applicative : 42 tests réussis (19 unitaires, 8 PostgreSQL, 15 Playwright), lint/types/format/build et deux contrôles GitHub réussis. Responsive 320/375/390/768/1440 px, clavier de base et captures mobile/desktop vérifiés.
- Vercel : projet le-bazar-de-msd créé dans soultaka19s-projects, Node 24, protection Vercel sur tous les déploiements. APP_ENV=demo, PAYMENT_MODE=disabled et secret Better Auth dédiés à Preview. Aucun déploiement lancé et aucune configuration Production activée.
- Neon : msd-demo, offre Free sans carte, Francfort (fra1), Auth/Realtime désactivés. Connexion uniquement à Preview, variables sensibles gérées par l’intégration. Les deux migrations et les seeds ont réussi après réauthentification utilisateur.
- Recette Neon : 4 produits démo lisibles ; 0 produit exposé avec le filtre production ; panier de 2 distributeurs = 25 000 XOF fictifs ; 2 rôles et 1 configuration ; 0 utilisateur et 0 commande.
- Restant pour une Preview : choix d’hébergement adapté au projet client (compte actuel Hobby), liaison Git/déploiement, APP_URL réel, contrôle HTTP et authentification distante. La préparation ne vaut pas recette d’un site déployé.

## Limites

Aucun abonnement payant ni déploiement effectué. Prix/stocks fictifs ; livraison non configurée ; aucune vente. CRUD administrateur et checkout attendent Phase 4. Aucun compte administrateur permanent créé. Récupération/MFA, WCAG complète, performances terrain et exploitation restent à finaliser. Les connexions de migration locales sont ignorées par Git ; aucun secret n’est publié.

## Tentative de Preview du 30 octobre 2026

L’utilisateur demande maintenant la mise en ligne temporaire. APP_URL Preview configuré sur https://le-bazar-de-msd-demo.vercel.app (alias non encore attribué), fonctions alignées sur fra1. L’API a classé la première tentative en Production malgré target=preview ; déploiement dpl_F97VG7XfUWoA3EHFfPZWbgVM4nyR annulé avant publication. Le contrôle automatique refuse une relance avec cible omise en raison du risque de Production non autorisée. Aucune URL fonctionnelle revendiquée.

Le comportement est signalé dans vercel/vercel#17069. Une page statique d’attente sans DB, secret ni paiement est préparée localement comme initialisation possible du projet, avec protection Vercel conservée ; son déploiement dans la cible Production nécessite l’accord explicite avant exécution. Le succès d’une Preview après cette initialisation n’est pas garanti.

## Mise en ligne vérifiée — 30 octobre 2026

L’utilisateur autorise explicitement Production pour débloquer la mise en ligne temporaire. La page statique protégée d’attente est READY en Production (dpl_Hv5s27okjmF32eG5BxfEueQYjHsT), sans base ni secret. Après cette initialisation, la boutique a pu être déployée en Preview (target null), READY : dpl_HALVv82bfJZqkDVG2KCVZ57XVZ9g, commit f66ddf39bb2241b3b2ff011dba6b524ed6005d7d.

Adresse stable de la boutique : https://le-bazar-de-msd-demo.vercel.app (APP_URL identique). Fonctions et Neon à Francfort. Authentification Vercel conservée ; aucune offre payante activée. Aucun changement de code applicatif pour contourner les garde-fous production.

Recette distante : health 200, catalogue 200 avec produits de démonstration, fiche horloge 200, panier 200, robots.txt interdit toute indexation et en-tête noindex présent. L’admin sans session mène au formulaire de connexion et /api/admin/status répond 401. Test navigateur : ajout d’une horloge et devis serveur à 18 000 XOF fictifs ; changement de quantité et persistance du panier contrôlés. Aucun achat ni paiement. La connexion d’un administrateur n’est pas testée à distance (aucun compte permanent provisionné).

## Accès public temporaire — 30 octobre 2026

À la demande explicite de l’utilisateur, la protection par connexion Vercel est désactivée pour le projet le-bazar-de-msd (ssoProtection=null). Le lien https://le-bazar-de-msd-demo.vercel.app est accessible sans compte Vercel. L’authentification applicative de l’administration reste inchangée.

Vérification HTTP indépendante, sans cookies ni lien de partage : catalogue et fiche horloge 200 sans redirection ; devis panier POST 200, deux horloges = 36 000 XOF fictifs ; endpoint administrateur 401. En-tête noindex/nofollow conservé, commandes et paiements toujours désactivés. Cette décision remplace la protection Vercel mentionnée dans les étapes précédentes, sans activer d’abonnement ni changer les données.
