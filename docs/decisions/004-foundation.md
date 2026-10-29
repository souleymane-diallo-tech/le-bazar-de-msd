# ADR 004 — Socle Phase 2

Statut : mis en œuvre localement, dans le cadre de la Phase 2 validée le 29 octobre 2026.

## Versions

Registre npm consulté avant installation : Next.js 16.4.3, React 19.3.1, Better Auth 1.7.14, Prisma 7.10.1, Tailwind 4.3.3, Vitest 5.0.5, Playwright 1.64.1. Node local 24.16.0. Prisma latest indiquait 8.0.0-rc.28 : préversion écartée. TypeScript 5.9.3 et ESLint 9 retenus pour la compatibilité du socle, plutôt qu'un changement majeur supplémentaire. Dépendances directes exactes et lockfile versionné.

## Authentification

Better Auth avec adaptateur Prisma et identifiants e-mail/mot de passe pour le personnel seulement. Aucun signup public ; endpoints exposés limités à connexion, session et déconnexion. Provisionnement par CLI avec JSON sur stdin ; hachage fourni par la bibliothèque. Aucun compte par défaut ni mot de passe prévisible.

Compte inactif et rôle inconnus refusés ; lecture serveur du rôle courant sur chaque accès. Limitation des tentatives stockée en PostgreSQL, sessions de huit heures et cache cookie désactivé.

Écart documenté au modèle conceptuel : les tables User/Session/Account/Verification suivent le contrat de Better Auth. Le champ Session.token est géré par la bibliothèque et n'est pas le tokenHash envisagé dans le document conceptuel. Les sauvegardes et accès DB doivent donc être strictement protégés. Pas de changement cryptographique maison. RateLimit est ajouté pour les fonctions sans état.

Récupération automatique par e-mail et MFA non configurées dans ce socle ; ne pas présenter la production comme prête sans valider le mécanisme de récupération, MFA et protections opérationnelles. Aucun faux bouton de récupération.

## Infrastructure

PostgreSQL 18.1 déjà installé utilisé pour deux bases locales isolées. Ni Docker ni service payant nécessaire aux tests locaux. Les fichiers de base et secrets sont dans .local et .env, exclus de Git. Le PostgreSQL managé et le stockage objet attendent sélection/coût validé ; aucun abonnement créé.

L'utilisateur a confirmé ses comptes personnels pour GitHub et Vercel. Le compte GitHub connecté est souleymane-diallo-tech (ID vérifié identique entre connecteur et CLI). Aucune autorisation de frais récurrents déduite de cette confirmation.

## Références

- https://better-auth.com/docs/integrations/next
- https://better-auth.com/docs/authentication/email-password
- https://better-auth.com/docs/concepts/rate-limit
- https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers

Les preuves de validation sont consignées dans docs/status.md après exécution, et non présumées par cette décision.
