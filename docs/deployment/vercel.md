# Démonstration et déploiement

## Cible Phase 2

Premier déploiement Vercel du socle en fin de Phase 2 ; boutique navigable en Phase 3. Aucune URL n'existe encore pour ce projet.

| Environnement         | Données et accès                                             | Paiements                             |
| --------------------- | ------------------------------------------------------------ | ------------------------------------- |
| Local                 | Base de développement                                        | Faux adaptateur explicite             |
| Preview/démonstration | Base/médias dédiés, données fictives, accès protégé, noindex | Faux adaptateur ou sandbox documentée |
| Production            | Base/médias et secrets distincts, domaine validé             | Livraison et prestataires autorisés   |

Une Preview ne doit jamais recevoir la chaîne de connexion de production. Les previews peuvent partager une base de démonstration au début, mais les changements de schéma concurrents imposent des bases isolées ou une coordination stricte.

## Pipeline proposé

1. PR : installation verrouillée, lint, format, types, tests, build.
2. Migration vérifiée sur base isolée puis démo ; seed fictif hors production.
3. Preview et smoke tests : accueil, accès DB, authentification, interdiction accès public admin.
4. Revue avant fusion ; main stable. Aucun push destructif.
5. Production séparée : sauvegarde, migration contrôlée, version approuvée, smoke tests.

Éviter un déploiement production automatique non approuvé après merge : contrôler promotion ou branche/environnement de production avant connexion GitHub. Prévoir évolutions de schéma compatibles avec l'ancienne et la nouvelle version ; un rollback applicatif ne restaure pas automatiquement la base.

## Configuration à prévoir

Connexion runtime PostgreSQL poolée ; connexion migration adaptée ; URL publique ; secrets auth ; paramètres stockage ; secrets fournisseurs et webhooks ; mode paiement ; protection de la démo. Noms définitifs après choix des bibliothèques. Fournir .env.example sans valeurs réelles en Phase 2.

Les faux adaptateurs doivent être refusés au démarrage en production. Les sauvegardes, la région, les alertes de coûts et la rétention des logs doivent être configurées et documentées.

## Fournisseurs et coûts

Vercel Hobby n'est pas destiné à cet usage commercial ; Pro est affiché à partir de 20 USD/mois, usage additionnel possible. Choisir PostgreSQL et stockage selon coût récurrent, sauvegardes, restauration, région et limites. Aucun abonnement n'est créé ou payé par ce dossier.

Sources vérifiées lors du cadrage le 29 octobre 2026, à revalider avant installation :

- https://vercel.com/docs/plans/hobby
- https://vercel.com/pricing
- https://vercel.com/kb/guide/connection-pooling-with-functions
- https://nextjs.org/docs/app/getting-started/installation
- https://docs.prisma.io/docs/orm/reference/system-requirements
- https://docs.wave.com/checkout
- https://docs.wave.com/webhook
- https://developer.orange.com/apis/om-webpay?hl=fr-fr

Accès comptes, tarifs contractuels, test des API et compatibilité des versions exactes restent à obtenir. Pas de coût global d'exploitation présenté comme vérifié.

## État au 30 octobre 2026

Projet Vercel créé et protégé, Node 24. Base Neon Free msd-demo à Francfort, connectée uniquement à Preview, migrations et catalogue fictif vérifiés. Aucun déploiement lancé : l’utilisateur maintient la préparation sans coût. APP_URL et recette HTTP restent en attente. Détails : ADR 006 et docs/status.md.

## Adresse de démonstration disponible

https://le-bazar-de-msd-demo.vercel.app — Preview protégée, commit f66ddf3, APP_ENV=demo et paiements désactivés. Une page d’attente statique occupe la cible Production après accord utilisateur ; ne pas confondre les deux déploiements. Recette et identifiants de déploiement dans docs/status.md.

Accès actualisé : depuis le 30 octobre, à la demande de l’utilisateur, la démonstration est publique sans connexion Vercel. La protection applicative de l’administration est conservée.
