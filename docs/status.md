# Suivi — 30 octobre 2026

- Phase actuelle : 3, boutique de démonstration prête pour revue ; Phase 4 non commencée.
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
