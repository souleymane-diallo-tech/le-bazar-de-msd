# Règles métier et flux

## Commande

1. Le client consulte un devis serveur sans réservation.
2. À la soumission : validation du téléphone, adresse, zone, publication, variantes et quantités. Le serveur recalcule les prix ; tout changement depuis le devis impose une nouvelle confirmation utilisateur.
3. Même clé + même contenu : retour de la commande existante ; même clé + contenu différent : conflit. La confirmation reste protégée, la clé de déduplication ne remplace pas le jeton d'accès.
4. Transaction : création commande et lignes snapshot, réservations, premier historique. Échec de stock sur une ligne : aucune commande partielle.
5. Retour de référence et accès opaque à la confirmation ; aucune donnée personnelle accessible via une référence séquentielle.

## États de commande

| État                 | Transitions permises        | Conditions                                                            |
| -------------------- | --------------------------- | --------------------------------------------------------------------- |
| PENDING_CONFIRMATION | CONFIRMED, CANCELLED        | Gestionnaire ; réservation valide ; paiement réussi si électronique   |
| CONFIRMED            | PREPARING, CANCELLED        | Gestionnaire ; annulation lance procédure remboursement si nécessaire |
| PREPARING            | SHIPPED, CANCELLED          | Gestionnaire ; consommation du stock à l'expédition                   |
| SHIPPED              | DELIVERED, DELIVERY_FAILED  | Résultat de livraison documenté                                       |
| DELIVERY_FAILED      | SHIPPED, RETURNED           | Réessai ou retour physique confirmé                                   |
| DELIVERED            | Aucune transition ordinaire | Correction exceptionnelle auditée ; remboursement distinct            |
| CANCELLED / RETURNED | Aucune                      | Terminaux                                                             |

Retour après livraison : traitement manuel documenté ; remboursement et mouvement de stock distincts, sans réécrire la commande livrée. L'état RETURNED décrit ici un échec de livraison retourné.

## Réservation proposée

- À la livraison : réserve jusqu'à confirmation manuelle, échéance proposée de 24 h ; durée à valider.
- Paiement électronique : échéance alignée sur la session prestataire ; durée jamais supposée sans documentation.
- Après confirmation : réserve maintenue jusqu'à expédition ; commandes anciennes visibles au gestionnaire.
- À l'expédition : diminution simultanée de onHand et reserved, réservation consommée et mouvement enregistré.
- Annulation avant expédition : libération unique. Après expédition : aucun réapprovisionnement tant que le retour physique n'est pas confirmé.
- Expiration et paiement concurrent : verrou/transaction arbitrent ; paiement tardif sans stock disponible → anomalie, pas de confirmation automatique, rapprochement ou remboursement.

## Paiement

États : PENDING, SUCCEEDED, FAILED, EXPIRED, PARTIALLY_REFUNDED, REFUNDED. Un événement plus ancien ne rétrograde pas un paiement réussi. L'annulation d'une commande n'implique pas un remboursement réussi.

La tentative est persistée avant l'appel réseau. Une erreur réseau ambiguë entraîne un rapprochement par référence, pas une nouvelle facturation aveugle. L'adaptateur doit exploiter l'idempotence ou les mécanismes documentés du prestataire ; sans moyen de résolution sûr, intervention manuelle.

Webhook : vérifier le corps brut et l'authenticité selon le prestataire, contrôler montant/devise/commande et dédupliquer, puis appliquer la transition et enregistrer le traitement dans une transaction. Une réponse navigateur n'est jamais une preuve.

Encaissement à la livraison : statut initial PENDING. Le gestionnaire saisit la collecte effective avec référence/motif ; livraison seule ≠ encaissement. Le propriétaire peut corriger/rembourser avec justification et audit. Les montants remboursés partiellement sont cumulés transactionnellement.

## Livraison et client

Tarif configurable par zone ; zone inactive exclue du checkout. La modification ultérieure d'un tarif n'affecte pas une commande. Adresse, quartier, téléphone et repère figés dans le snapshot ; correction autorisée avant expédition et auditée.

Pas de fusion automatique des clients partageant un téléphone ; pas de compte client public au MVP. Aucun délai de livraison garanti affiché avant validation commerciale.
