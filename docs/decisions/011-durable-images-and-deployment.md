# ADR 011 — Préparation du stockage durable et du déploiement

19 novembre 2026 : l’utilisateur demande une proposition de stockage durable et la préparation du déploiement. Vercel Blob privé retenu comme proposition, sans activation distante à ce stade. Le choix évite un compte supplémentaire et conserve le contrôle d’accès des photos de brouillons via la route applicative. Comparaison, quotas et étapes dans `docs/deployment-preparation.md`.

Adaptateur local/Blob explicite ; disque local refusé sur Vercel. SDK 2.9.0, authentification serveur uniquement. Clés déterministes par SHA-256, même chemin applicatif et données SQL indépendantes du fournisseur. Un écrasement ne peut remplacer que les mêmes octets correspondant à cette empreinte. Pas de suppression automatique.

Script d’inventaire sans effet par défaut, copie et vérification avec `--apply` seulement. Inventaire effectué : quatre photos versionnées, zéro import référencé ; fichiers d’essai orphelins exclus. Aucune copie ou migration distante faite.

Audit des nouvelles dépendances : surcharge ciblée Zod 4.6.7 pour `@vercel/cli-config` et Effect 3.22.1 pour `@prisma/config`, dans la même version majeure, pour les avis [Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) et [Effect](https://github.com/advisories/GHSA-7589-6fvf-x4pw). Pas de rétrogradation Prisma ni audit fix forcé. Revoir ces surcharges lorsque les dépendances parentes intègrent les correctifs.

La préparation ne vaut pas validation du store réel, migration Neon, activation WhatsApp distante, création de compte distant ou publication. Aucun coût engagé. Le compte WhatsApp et les identifiants temporaires restent locaux.

## Exécution du 20 novembre 2026

Stockage privé créé et connecté au projet en Preview par OIDC. Sauvegarde Neon locale vérifiée, migrations additives appliquées et accès propriétaire distant temporaire créé. Recette distante réussie et alias publié : écriture/lecture réelle Blob, protection du brouillon, publication puis archivage du produit technique, commande fictive et récapitulatif WhatsApp sans envoi. Stock restitué après annulation de la commande de recette. Aucun abonnement activé.
