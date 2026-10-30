# ADR 006 — Préparation distante gratuite et isolée

Date : 30 octobre 2026. Statut : accepté pour la préparation ; déploiement différé.

L’utilisateur demande de préparer la version Phase 3 avant la phase suivante et choisit explicitement de maintenir la préparation sans coût. Il autorise Neon Free, les conditions Neon/Marketplace et le partage annoncé des informations de compte, ainsi que les secrets propres à la démonstration dans Preview.

Le projet Vercel le-bazar-de-msd utilise Node 24 et une protection par authentification Vercel sur tous les déploiements. La base Neon msd-demo utilise Free à Francfort ; Auth et Realtime sont désactivés. Elle est connectée uniquement à Preview, sans génération automatique de branches. Les variables de connexion et Better Auth sont sensibles ; aucune variable Production n’est configurée.

Deux migrations et les seeds ont été appliqués sur cette base dédiée. La recette directe vérifie les quatre produits fictifs, leur exclusion du catalogue production et le devis panier ; elle ne remplace pas une recette HTTP distante.

Le compte Vercel est Hobby, réservé à l’usage personnel non commercial. Aucun plan payant, essai Pro, déploiement ou promotion n’est activé. Le choix d’un hébergement adapté au projet client reste ouvert. APP_URL sera fixé sur l’URL réellement déployée, puis testé avec les origines et cookies d’authentification.

Les secrets de migration sont conservés uniquement dans un fichier local ignoré. Les migrations restent hors du build automatique des Previews pour éviter les modifications concurrentes de schéma.
