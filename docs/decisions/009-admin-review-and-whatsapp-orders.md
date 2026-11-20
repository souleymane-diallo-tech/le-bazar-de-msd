# ADR 009 — Recette administrateur et transmission WhatsApp

Date : 19 novembre 2026. Demande utilisateur : avancer par itérations, fournir un accès temporaire et valider le catalogue, le panier et la commande jusqu’au gérant.

- Démonstration locale : compte propriétaire généré aléatoirement, valable sept jours ; identifiants dans `.local/acces-admin-temporaire.md`, ignoré par Git. Aucun compte distant provisionné.
- Migration additive `accessExpiresAt` nullable : vérification à chaque lecture de session et autorisation transactionnelle, y compris pour une session ouverte. Comptes existants inchangés.
- Gestion existante des catégories, produits, variantes, prix, stocks, zones et commandes conservée. Ajout de raccourcis, recherche et pagination du catalogue. Archivage sans effacer les commandes. Quatre photos validées conservées.
- Bouton WhatsApp validé par le client explicitement choisi. Message construit côté serveur à partir des snapshots après validation du jeton privé : référence, état, articles/SKU, total, livraison, nom, téléphone, adresse et instructions. Aucun jeton ni secret dans le message.
- Le client doit appuyer sur Envoyer dans WhatsApp. Aucune notification automatique ni preuve de réception ; aucun changement d’état par le bouton. Le gérant vérifie la référence dans l’administration avant traitement.
- Aucun envoi externe durant les tests. Le texte du bouton explique les données transmises. Aucun nouveau prestataire, abonnement ou paiement mobile.

## Dépendances

Next.js 16.4.3 a signalé les avis de cache [GHSA-mfr8-8qww-v76h](https://github.com/advisories/GHSA-mfr8-8qww-v76h) et [GHSA-vc7v-qv4w-wrv8](https://github.com/advisories/GHSA-vc7v-qv4w-wrv8). Correctif à partir de 16.4.5 ; mise à jour vers 16.4.6 et plugin ESLint aligné effectuée. Build réussi, `npm audit --omit=dev` sans avis restant au contrôle du 19 novembre. Les neuf avis modérés de l’audit incluant les outils de développement ne sont pas traités ici. Ne vaut pas audit exhaustif de sécurité.

## Limites

Pas de vente réelle, déploiement ni migration distante. L’adresse locale fonctionne sur l’ordinateur hébergeant le serveur. La recette de lancement, l’hébergement commercial et les données réelles restent distincts.
