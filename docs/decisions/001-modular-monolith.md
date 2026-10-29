# ADR 001 — Monolithe modulaire Next.js

Statut : proposé pour validation de Phase 1. Date : 2026-10-29.

Contexte : moins de 50 produits, budget et délai contraints, expérience mobile, démonstration Vercel.

Décision proposée : conserver Next.js/React/TypeScript, services métier serveur et PostgreSQL/Prisma dans une seule application. Séparer catalogue, stock, commandes, paiements et livraison par responsabilités, avec transactions communes lorsque nécessaire.

Alternatives : microservices (coût opérationnel injustifié) ; SPA et API séparées (plus de surface à exploiter) ; Shopify (ne répond pas au choix sur mesure exprimé). Aucune migration vers une autre plateforme n'est proposée.

Conséquences : déploiement simple, cohérence transactionnelle ; discipline nécessaire pour éviter couplage UI/métier. Les composants et routes ne deviennent pas propriétaires des règles commerciales.
