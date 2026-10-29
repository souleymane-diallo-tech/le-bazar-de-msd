# Hébergement : proposition à valider

Préparé le 29 octobre 2026. Comptes personnels autorisés ; aucun abonnement payé ni service distant créé.

| Composant        | Proposition                               | Coût affiché / réserve                                                                                                           |
| ---------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Application      | Vercel Pro                                | 20 USD/mois affichés, hors taxes et éventuels dépassements ; usage commercial non couvert par Hobby                              |
| PostgreSQL démo  | Neon Free, branche ou projet dédié        | 0 USD, sans carte, limites annoncées de 100 CU-heures/mois et 1 Go par projet ; vérifier région et restauration avant production |
| Médias catalogue | Stockage objet S3-compatible, R2 candidat | Frais de stockage/opérations à valider avant activation ; la Phase 2 utilise seulement une image statique fournie                |

Recommandation pour débloquer la Preview : connecter Vercel, autoriser l'offre Pro et configurer une base Neon Free de démonstration. Les protections de déploiement Vercel doivent restreindre l'accès à cette démo. Aucun engagement de production sur un plan gratuit sans examen des sauvegardes et limites.

## Préparation technique

Importer le dépôt privé `souleymane-diallo-tech/le-bazar-de-msd`, framework Next.js, Node 24. Commande build `npm run build`. Utiliser la branche `feat/phase-2-foundation` en Preview. Ne pas promouvoir automatiquement main en production avant recette.

Variables Preview : APP_ENV=demo, APP_URL=https://<url-fixe-de-demo>, DATABASE_URL (connexion poolée de la base de démo), DIRECT_URL (connexion de migration), BETTER_AUTH_SECRET (aléatoire, 32 caractères minimum), PAYMENT_MODE=disabled. APP_URL doit correspondre au domaine réellement utilisé pour les cookies et contrôles d'origine ; une nouvelle URL nécessite sa configuration avant recette auth.

Appliquer `prisma migrate deploy` sur la base de démo depuis un processus autorisé ; ne pas exécuter de migration dans le build de chaque Preview. Provisionner l'administrateur via stdin sécurisé. Aucun secret dans une PR, un chat ou le dépôt.

Vérifications : accueil, connexion propriétaire/gestionnaire, DB, absence d'inscription publique, refus d'accès anonyme, HTTPS, noindex, protection Vercel, aucune clé de paiement réelle. Aucune URL de démonstration n'est revendiquée tant que ces étapes ne sont pas exécutées.

Sources officielles consultées :

- https://vercel.com/pricing
- https://vercel.com/docs/plans/hobby
- https://neon.com/pricing
- https://www.cloudflare.com/products/r2/
