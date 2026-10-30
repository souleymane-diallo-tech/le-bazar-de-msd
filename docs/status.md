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
