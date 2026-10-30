# ADR 006 — Préparation distante gratuite et isolée

Date : 30 octobre 2026. Statut : accepté pour la préparation ; déploiement différé.

L’utilisateur demande de préparer la version Phase 3 avant la phase suivante et choisit explicitement de maintenir la préparation sans coût. Il autorise Neon Free, les conditions Neon/Marketplace et le partage annoncé des informations de compte, ainsi que les secrets propres à la démonstration dans Preview.

Le projet Vercel le-bazar-de-msd utilise Node 24 et une protection par authentification Vercel sur tous les déploiements. La base Neon msd-demo utilise Free à Francfort ; Auth et Realtime sont désactivés. Elle est connectée uniquement à Preview, sans génération automatique de branches. Les variables de connexion et Better Auth sont sensibles ; aucune variable Production n’est configurée.

Deux migrations et les seeds ont été appliqués sur cette base dédiée. La recette directe vérifie les quatre produits fictifs, leur exclusion du catalogue production et le devis panier ; elle ne remplace pas une recette HTTP distante.

Le compte Vercel est Hobby, réservé à l’usage personnel non commercial. Aucun plan payant, essai Pro, déploiement ou promotion n’est activé. Le choix d’un hébergement adapté au projet client reste ouvert. APP_URL sera fixé sur l’URL réellement déployée, puis testé avec les origines et cookies d’authentification.

Les secrets de migration sont conservés uniquement dans un fichier local ignoré. Les migrations restent hors du build automatique des Previews pour éviter les modifications concurrentes de schéma.

## Actualisation : publication autorisée

L’utilisateur a ensuite autorisé explicitement Production. Une page statique d’attente protégée a initialisé le projet ; la boutique a alors pu être publiée en Preview, sans modifier les garde-fous qui excluent la démo de production. L’API exige l’omission de target pour Preview (la chaîne preview n’est pas acceptée après initialisation). URL stable : https://le-bazar-de-msd-demo.vercel.app. Aucun abonnement modifié. La validation commerciale avant ouverture des ventes reste distincte de cette démonstration.

## Accès public temporaire autorisé

Le 30 octobre, l’utilisateur demande explicitement un accès depuis son téléphone sans authentification Vercel. La protection Vercel est donc désactivée au niveau du projet. L’administration conserve Better Auth et ses permissions serveur ; aucune vente n’est activée. Le catalogue reste fictif et noindex. Vérifications sans cookies réussies : pages 200, panier 200, API admin 401.
