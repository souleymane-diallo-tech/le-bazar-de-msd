# Architecture cible

## Structure

Une application Next.js App Router / TypeScript strict, un dépôt privé, une base PostgreSQL et un stockage objet. React, Tailwind et shadcn/ui pour l'interface ; Prisma pour l'accès aux données ; Zod aux frontières serveur. Runtime Node.js pour les fonctions métier. Pas de microservices.

```text
src/app/(store)                 pages publiques et checkout
src/app/(admin)/admin           pages protégées
src/app/api/payments/[provider] webhooks
src/modules/catalog            catalogue
src/modules/inventory          stock et réservations
src/modules/orders             orchestration commande
src/modules/payments           tentatives et adaptateurs
src/modules/delivery           zones et expéditions
src/modules/customers          coordonnées et historique
src/modules/identity           sessions et autorisations
src/modules/settings           paramètres et marketing
src/modules/audit              journal sensible
src/components/ui              composants de présentation
src/lib                        infrastructure partagée minimale
prisma                         schéma, migrations, seed de démonstration
tests                          intégration et E2E
```

Cette arborescence est une cible, pas des dossiers applicatifs déjà initialisés. Chaque module expose ses services ; séparation service/règles/accès aux données uniquement lorsque utile. Aucun framework de repository générique.

## Contrats métier proposés

| Service | Entrée | Sortie et obligations |
|---|---|---|
| Catalog.listPublished | recherche, catégorie, tri, page validés | Données publiques paginées, tri secondaire stable par ID |
| Orders.quote | variantes/quantités, zone | Total XOF serveur et anomalies ; aucune réservation |
| Orders.place | clé idempotente, panier, adresse, moyen | Commande, total final, référence, accès confirmation ; transaction avec réservations |
| Inventory.reserve | transaction, lignes, commande, échéance | Réservations atomiques ou échec global |
| Orders.transition | acteur, commande, version, statut | Transition autorisée, historique et effets stock atomiques |
| Payments.start | commande, moyen, clé tentative | Tentative persistée puis appel prestataire hors transaction |
| Payments.handleEvent | corps brut, en-têtes, fournisseur | Authentification, validation, déduplication, mise à jour atomique |
| Delivery.quote | zone active | Frais entiers XOF et identifiant de configuration |
| Payments.recordCollection | acteur, montant, référence, clé | Encaissement journalisé ; aucun double encaissement |

Erreurs stables : VALIDATION_ERROR, OUT_OF_STOCK, PRICE_CHANGED, DELIVERY_UNAVAILABLE, FORBIDDEN, CONFLICT, PAYMENT_UNAVAILABLE. Messages français côté UI ; détails internes dans les logs filtrés.

## Frontières

- Aucun calcul de prix ou permission confié au navigateur.
- Server Actions et routes valident les entrées, identifient l'acteur puis appellent un service.
- Le module commandes orchestre stock et commande dans la même transaction PostgreSQL ; les services peuvent recevoir le même contexte transactionnel.
- Appels réseau hors transaction ; pas de supposition de transaction distribuée avec les paiements.
- Le cache public ne contient aucune donnée client ; invalidation après publication, changement de prix ou stock. Checkout toujours autoritaire.
- Catalogue rendu côté serveur ; panier interactif côté client. Administration non indexée et non mise en cache publiquement.
- Requêtes PostgreSQL via connexion poolée compatible avec le fournisseur ; migrations via connexion et pipeline adaptés.
- Upload direct signé vers stockage objet après autorisation, limites de taille/type et validation serveur.

## Tâches différées minimales

Expiration des réservations et rapprochement des paiements par tâche planifiée authentifiée, idempotente et réexécutable. Retards visibles au back-office. Les transactions empêchent une expiration et une consommation concurrentes de réussir toutes les deux.

Pas de Redis ni file de messages au MVP. Si un prestataire exige un traitement plus long que la limite d'une requête, un événement durable en base et son traitement planifié sont requis avant activation.

## Choix encore ouverts

Bibliothèque d'authentification éprouvée (pas de cryptographie maison), fournisseur PostgreSQL, stockage, récupération de compte et observabilité. La Phase 2 exige leurs choix, coûts et compatibilités documentés. Pas d'engagement sur une version « latest » non vérifiée.
