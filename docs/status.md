# Suivi — 31 octobre 2026

## État courant : phase 4 de démonstration prête pour revue

- Autorisation : phase 4, livraison fictive et expiration à 24 h validées ; maintien des quatre photos confirmé le 31 octobre. Aucun abonnement ni import de médias supplémentaire.
- Branche : `features/phase-4-orders`, issue de `feat/phase-3-storefront`. `main` inchangée, PR précédentes non fusionnées.
- Implémenté : checkout invité de démonstration, devis signé/reconfirmation, idempotence et accès privé à la confirmation ; réservations transactionnelles ; administration catalogue/variantes/stock, zones, commandes, corrections d’adresse, collecte et remboursements fictifs ; dashboard et audit.
- Garde-fous : `CHECKOUT_MODE=disabled` par défaut, `demo` interdit en production ; services limités aux données fictives ; aucune vente réelle ni paiement électronique. Import de photos hors périmètre de cette démo à la demande utilisateur.
- Données : migration additive `202610300001_demo_orders` appliquée seulement aux bases locales de développement et test. Zones fictives locales : 1 500 / 2 500 XOF. Base Neon et variables Vercel non modifiées.
- Vérifié : build final réussi, TypeScript, lint, format et `git diff --check` ; **60 tests passants : 20 unitaires, 22 PostgreSQL, 18 Playwright**. Les trois scénarios checkout ont aussi réussi cinq répétitions chacun (15 exécutions). Recette aux largeurs 320/375/390/768/1440, parcours checkout clavier et inspection des captures mobile. Aucun audit WCAG complet revendiqué.
- Corrections de recette : attente explicite de réponse/navigation lors de la connexion à froid ; isolation des compteurs de tentatives entre exécutions E2E dans la seule base locale, sans désactiver le limiteur applicatif. Première reconstruction Turbopack bloquée par son cache/processus CSS, puis builds réussis après nettoyage du seul dossier `.next`.
- Site public : https://le-bazar-de-msd-demo.vercel.app reste sur la Phase 3 précédemment déployée, commandes désactivées. Cet incrément local n’est pas une mise en ligne ni une activation commerciale.
- Limites : expiration opportuniste/bouton admin, pas de tâche planifiée hors trafic ; aucun compte permanent provisionné ; médias limités aux quatre photos ; paramètres commerciaux réels, récupération/MFA et recette de lancement restent à finaliser.
- Guide : `docs/admin-demo.md`. Décisions : ADR 007. Les phases 5 et suivantes ne sont pas engagées.

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
