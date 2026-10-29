# Plan de vérification

Statut : tests spécifiés, non exécutés. Aucun code applicatif à cette phase.

## Matrice de recette

| ID  | Scénario                                           | Attendu                                             | Niveau                      |
| --- | -------------------------------------------------- | --------------------------------------------------- | --------------------------- |
| T01 | Produit brouillon demandé directement              | Non accessible au public                            | Intégration                 |
| T02 | Prix navigateur modifié                            | Prix ignoré ; devis serveur et reconfirmation       | Intégration/E2E             |
| T03 | Deux commandes concurrentes pour dernière unité    | Une seule réserve réussit ; stock jamais négatif    | Intégration PostgreSQL réel |
| T04 | Même clé soumise deux fois                         | Une commande, même résultat autorisé                | Intégration                 |
| T05 | Même clé avec panier différent                     | Conflit sans mutation                               | Intégration                 |
| T06 | Une ligne sur trois indisponible                   | Transaction intégralement annulée                   | Intégration                 |
| T07 | Annulation répétée                                 | Stock libéré une fois                               | Intégration                 |
| T08 | Expiration concurrente avec paiement               | Un résultat cohérent ; paiement tardif rapproché    | Intégration                 |
| T09 | Webhook invalide / rejoué / montant incorrect      | Aucun paiement indu ; doublon sans effet            | Intégration prestataire     |
| T10 | Retour navigateur succès sans preuve serveur       | Paiement encore en attente                          | E2E                         |
| T11 | Commande livrée non encaissée                      | Non comptée comme encaissement                      | Unitaire/intégration        |
| T12 | Retour physique confirmé deux fois                 | Un seul mouvement de réapprovisionnement            | Intégration                 |
| T13 | Remboursements cumulés dépassant encaissé          | Dernière opération refusée                          | Intégration                 |
| T14 | Gestionnaire appelle gestion des rôles directement | Refus côté serveur                                  | Intégration                 |
| T15 | Référence commande d'un tiers devinée              | Aucune donnée exposée sans jeton valide             | Intégration                 |
| T16 | Changement frais après achat                       | Snapshot de la commande inchangé                    | Intégration                 |
| T17 | Checkout clavier et mobile                         | Commande possible sans perte de saisie              | E2E + manuel                |
| T18 | Refus consentement                                 | Aucun traceur non essentiel lancé                   | E2E réseau                  |
| T19 | Sauvegarde restaurée                               | Commandes et soldes vérifiés en environnement isolé | Exploitation                |

Tests unitaires : calcul total, transitions, permissions, normalisation et invariants. Intégration avec PostgreSQL, pas SQLite pour les tests de concurrence. E2E sur démo avec paiements simulés isolés ou sandbox officiellement disponible.

## UI et performance

Recette à 320, 375, 390, 768 et 1440 px : aucun overflow global, contenu lisible, focus visible, formulaires étiquetés, navigation clavier, contraste WCAG 2.2 AA mesuré. Audit automatique complété par vérification manuelle, zoom et lecteur d'écran sur parcours critique.

Cibles : LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. Mesure de laboratoire reproductible sur pages représentatives et téléphone réel en connexion limitée. Les Core Web Vitals terrain au 75e percentile ne sont déclarés atteints qu'après données réelles suffisantes ; Lighthouse seul ne démontre pas l'INP terrain.

## Gate de livraison

Lint, format vérifié, typecheck, tests métier/intégration, E2E critique et build passent sur la révision livrée. Aucun défaut de sécurité critique ou défaut bloquant ouvert. Paiements activés uniquement si leurs scénarios sont validés. Sauvegarde/restauration et procédure de repli testées. Recette et production approuvées par le responsable technique.
