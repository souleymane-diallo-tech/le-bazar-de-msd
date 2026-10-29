# Exécution locale et vérifications

Prérequis : Node 24 (version testée dans .node-version), npm, PostgreSQL 18. Bases séparées `msd_dev` et `msd_test`, accessibles seulement localement. La copie de travail possède une configuration .env locale non versionnée, avec secrets aléatoires ; aucun compte administrateur permanent n'est créé automatiquement.

## Nouvelle installation

1. `npm ci`.
2. Copier .env.example vers .env et renseigner des identifiants locaux et un secret aléatoire de 32 caractères minimum ; jamais les envoyer en chat.
3. Créer deux bases vides `msd_dev` et `msd_test` avec votre installation PostgreSQL. Ne jamais utiliser une base de production pour la recette.
4. `npm run db:generate`, puis `npm run db:migrate` et `npm run db:seed`.
5. Appliquer la migration à la base de test en affectant DIRECT_URL à TEST_DATABASE_URL dans l'environnement du processus ; restaurer ensuite DIRECT_URL.
6. `npm run dev` puis http://localhost:3000.

L'accueil est une page d'ouverture prochaine. Les routes commerce ne sont pas encore implémentées. `/api/health` est une sonde applicative, pas une preuve de connexion DB. `/api/admin/status` vérifie la DB et exige un propriétaire authentifié.

## Compte administrateur

`npm run admin:provision` attend un objet JSON sur stdin avec email, name, password (12 à 128 caractères) et role (OWNER ou MANAGER). Utiliser un canal d'entrée privé, sans mettre le mot de passe dans la ligne de commande, un fichier versionné ou l'historique du shell. Le script refuse un e-mail déjà existant et journalise le provisionnement.

L'inscription publique est désactivée. La récupération automatique par e-mail n'est pas configurée ; sa mise en place et la politique MFA sont des prérequis de production.

## Contrôles

`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run build`, puis `npx playwright install chromium` et `npm run test:e2e`.

Les tests d'intégration refusent une URL ne se terminant pas par `_test`. Les tests E2E créent et suppriment leurs propres comptes éphémères dans une base `_dev` seulement. Aucun mot de passe de test n'est conservé.

## Instance locale créée dans cette session

Binaires préexistants : `C:/Program Files/PostgreSQL/18/bin`. Données : `.local/postgres`, port 55432, écoute 127.0.0.1, authentification SCRAM. Les fichiers `.local` sont exclus du dépôt. Démarrage avec pg_ctl, arguments `-D <chemin-absolu>/.local/postgres -l <chemin-absolu>/.local/postgres.log -o "-h 127.0.0.1 -p 55432" -w start`. Arrêt propre : `pg_ctl -D <chemin-absolu>/.local/postgres -m fast -w stop`.

Ce cluster local ne remplace pas une base managée sauvegardée. Les erreurs détaillées des outils de DB sont réservées au poste de développement.
