# Préparation du déploiement de démonstration — 19 novembre 2026

## Proposition de stockage

Vercel Blob **privé**, région Francfort, connecté au projet `le-bazar-de-msd` uniquement pour Preview. Neon garde les données métier et les références `/media/products/<empreinte>.webp`. Les fichiers restent indépendants des déploiements. Notre route vérifie publication ou droits administrateur avant lecture. SDK `@vercel/blob` 2.9.0 ; aucune URL Blob ni clé transmise au navigateur.

Hobby inclut 1 Go de stockage, 10 Go de transfert, 10 000 opérations simples et 2 000 avancées ; dépassement bloquant sans facturation additionnelle. Ces quotas ne garantissent pas une disponibilité illimitée. Le transit des blobs privés par les fonctions utilise aussi les quotas réseau/fonctions. [Documentation officielle](https://vercel.com/docs/vercel-blob/usage-and-pricing).

Alternative étudiée : Cloudflare R2, 10 Go gratuits et sortie Internet sans frais, mais compte/identifiants et configuration supplémentaires. Pas nécessaire pour les quatre produits actuels. [Tarifs R2](https://developers.cloudflare.com/r2/pricing/).

## État vérifié et cible

- Projet Vercel existant : `prj_Z3gcIgKbPmZViLoaZ951zdMJDP0N`, équipe `team_Xj8h2RW3oaOjAlN9Ql6ESRCv`, Node 24 ; dernière boutique READY : `dpl_HALVv82bfJZqkDVG2KCVZ57XVZ9g`, Preview. Production commerciale non préparée.
- Alias prévu conservé : `https://le-bazar-de-msd-demo.vercel.app`. Site actuel laissé en place. Aucun stockage Blob créé, aucune variable distante modifiée, aucune migration distante exécutée par cette préparation.
- `vercel.json` fixe `fra1`. `.vercelignore` exclut les fichiers privés, secrets locaux, photos importées et rapports de tests.
- Le code sélectionne `local`, `vercel-blob` ou `disabled`. Le disque local est interdit sur Vercel ; absence de connexion Blob = import désactivé. Les quatre photos versionnées continuent de fonctionner.

## Exécution après validation du stockage

1. Créer un store **privé**, sans abonnement/essai Pro, et le connecter à Preview uniquement. Vérifier l’offre réelle affichée avant validation. Conserver Production déconnectée.
2. Configurer Preview : `APP_ENV=demo`, `APP_URL=https://le-bazar-de-msd-demo.vercel.app`, `CHECKOUT_MODE=demo`, `PAYMENT_MODE=disabled`, `SEO_INDEXING=disabled`, `PRODUCT_IMAGE_STORAGE=vercel-blob`. Conserver les secrets Better Auth/Neon existants. Connexion Blob par `BLOB_STORE_ID`/OIDC ; jeton serveur uniquement si nécessaire. Aucun secret dans Git ou le chat.
3. Sauvegarder la base distante et relever ses migrations. Appliquer uniquement les migrations additives manquantes `202610300001_demo_orders` et `202611190001_temporary_admin`. Aucun reset, aucun dump local remplaçant la base distante. Exécuter les seeds démo/livraison idempotents après vérification de la base cible.
4. Inventorier les images locales : `npx tsx scripts/prepare-product-images.ts`. Le mode par défaut ne transfère rien. Après connexion au store, `--apply` copie uniquement les fichiers référencés et vérifie leurs octets ; aucun original supprimé. Les références produits doivent aussi exister dans la base cible : ce script ne copie pas le catalogue SQL.
5. Créer un nouvel accès propriétaire temporaire distant via `scripts/provision-admin.ts` et stdin, avec une nouvelle expiration et un nouveau mot de passe. Ne pas réutiliser le compte local. Configurer le numéro WhatsApp fourni dans les paramètres distants seulement lors de l’activation approuvée ; il reste local à ce stade.
6. Publier la branche relue, exécuter CI, puis déployer une nouvelle Preview. Tester l’URL candidate avant déplacement de l’alias : health, accès admin/expiration, ajout produit/photo, publication, panier/commande et récapitulatif WhatsApp sans envoyer de message pendant la recette. Tester un visiteur anonyme, robots noindex et absence de paiement réel.
7. Affecter l’alias seulement après recette. Vérifier les logs, les quotas Blob et la consultation mobile. Aucune promotion automatique en production commerciale.

## Repli

Conserver l’identifiant du déploiement précédent. En cas d’échec, ne pas déplacer l’alias ou le remettre sur ce déploiement ; arrêter les nouveaux essais de commande. Garder les migrations additives et données nouvelles, sans migration descendante ni suppression de photos. Conserver une sauvegarde indépendante des images et de Neon. Un stockage durable ne remplace pas une sauvegarde.

## Limites

Préparation du code et tests locaux ne prouvent pas le fonctionnement d’un store réel. Activation Blob, migrations, compte distant, transfert éventuel et recette distante restent à effectuer. Le contexte Hobby/personnel doit être réévalué avant un usage commercial client ; aucune offre payante n’est autorisée actuellement.
