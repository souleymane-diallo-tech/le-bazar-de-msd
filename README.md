# Le Bazar de MSD

Boutique mobile-first pour Dakar : catalogue inférieur à 50 produits, prix en XOF, achat invité et administration des ventes.

## État

Conception validée et Phase 2 autorisée le 29 octobre 2026. Socle Next.js, PostgreSQL, Better Auth et CI implémenté ; page d'ouverture prochaine et administration protégée. Aucun checkout ni paiement réel. Démonstration distante en attente de connexion Vercel et validation de l'hébergement.

L'accord de démarrage ne confirme pas les tarifs, le budget exact, les comptes marchands ou les règles commerciales manquantes. Comptes personnels confirmés pour GitHub/Vercel. Voir [les décisions en attente](docs/decisions/pending.md).

## Développement

Node 24, npm et PostgreSQL 18. `npm ci`, configuration privée `.env` depuis `.env.example`, `npm run db:generate`, `npm run db:migrate`, puis `npm run dev`. Instructions complètes et bases de test : [guide local](docs/deployment/local.md).

Contrôles : `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run build`, `npm run test:e2e`. Les tests DB utilisent une base distincte ; Playwright utilise le build de production local.

Authentification : pas d'inscription publique. Provisionnement contrôlé avec `npm run admin:provision` et JSON sur stdin sécurisé. Aucune identité permanente ou mot de passe par défaut. Ne jamais exposer les secrets dans les arguments ou les logs.

## Lecture

- [Suivi](docs/status.md)
- [Périmètre et besoins](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Modèle de données](docs/data-model.md)
- [Règles et flux](docs/business-rules.md)
- [Design et maquettes](docs/design/design-system.md)
- [Backlog](docs/backlog.md)
- [Plan de livraison](docs/roadmap.md)
- [Sécurité](docs/security/security.md)
- [Recette](docs/testing/acceptance.md)
- [Démonstration Vercel](docs/deployment/vercel.md)

Les dépendances sont verrouillées dans package-lock.json ; voir [ADR 004](docs/decisions/004-foundation.md). La prochaine décision externe concerne [l'hébergement proposé](docs/deployment/hosting-decision.md), sans abonnement déjà souscrit.
