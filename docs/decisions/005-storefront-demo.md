# ADR 005 — Catalogue public, panier et démonstration

Date : 29 octobre 2026. Statut : implémenté dans la Phase 3 autorisée par l'utilisateur, avec données de démonstration explicitement approuvées.

## Catalogue

Lecture PostgreSQL via un repository métier ; seuls produits PUBLISHED non archivés, catégories actives et variantes actives sont exposés. Stock disponible = physique − réservé. `React.cache` déduplique uniquement dans une requête ; pas de cache partagé de prix ou stock. Recherche insensible aux accents, filtres, tris déterministes et pagination de 12 produits ; le catalogue initial inférieur à 50 produits est filtré en mémoire après une lecture unique.

La migration ajoute Product.isDemo. Le seed `npm run db:seed:demo` est interdit en production et n'écrase pas les produits existants. Les quatre photos fournies sont accompagnées de descriptions prudentes ; prix, stocks et une variante épuisée sont fictifs. Le repository exclut les produits isDemo lorsque APP_ENV=production. Aucun produit de démonstration ne doit être transformé en article commercial sans validation de son contenu.

Médias : copies locales des originaux et optimisation Next Image. Galerie multiple et image par variante supportées, mais une seule photo source disponible par produit de démonstration. Le stockage objet et les uploads administrateur restent à implémenter lors de l'administration.

## Panier

Stockage local versionné : identifiant de variante, quantité et prix observé à l'ajout (pour afficher un changement, jamais pour calculer le montant dû). Pas de données client, de session ou de secret. Lecture validée par Zod, récupération des stockages corrompus, synchronisation entre onglets et repli en mémoire si stockage indisponible.

Le devis est recalculé au serveur depuis les produits publics ; aucune confiance dans le prix du navigateur. Articles retirés, stock devenu insuffisant et changement de prix sont signalés. Aucune réservation, commande ou transaction financière. Les frais de livraison sont inconnus, affichés « À déterminer » plutôt que gratuits ; le total livré n'est pas inventé. Le checkout reste désactivé jusqu'à la Phase 4.

## Affichage et accès

Page accueil, catalogue, fiche et panier avec navigation commune. Démonstration identifiée dans les cartes, fiches et récapitulatifs. Partage natif ou copie du lien ; WhatsApp uniquement si contacts.whatsapp contient un numéro valide, aucun numéro fictif. Metadata produit, noindex conservé pour la préparation.

Le skeleton est limité au catalogue : une fiche inconnue doit pouvoir répondre 404 avant streaming. Source : https://nextjs.org/docs/app/api-reference/file-conventions/not-found.

## Dépendances et Git

L'utilisateur a rendu le dépôt public provisoirement. Cette visibilité est conservée ; .env et .local restent exclus. Phase 3 part de feat/phase-2-foundation et sa PR cible cette branche tant que la PR #1 n'est pas intégrée. Aucune fusion implicite ni modification de main.

Le seed de démonstration permet la recette du storefront avant le CRUD administrateur B08. Ce dernier reste prévu dans la phase d'administration ; B09 ne dépend plus de son interface mais du schéma et de données préparées. Le déploiement Vercel non finalisé en Phase 2 reste une dette explicite, sans bloquer le développement local autorisé.
