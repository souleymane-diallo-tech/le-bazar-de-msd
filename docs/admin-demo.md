# Guide de la phase 4 — démonstration locale

## Préparer

Utiliser une base locale dédiée et les secrets locaux ignorés par Git. Appliquer les migrations, `npm run db:seed:demo`, puis `npm run db:seed:delivery-demo`. Configurer `CHECKOUT_MODE=demo` et conserver `PAYMENT_MODE=disabled`. Ne jamais utiliser la configuration de démonstration en production. Le seed ne remplace pas les modifications administrateur.

Le compte équipe se provisionne via le script existant `npm run admin:provision` et son entrée JSON sur stdin ; jamais de mot de passe en argument, commit ou conversation. Aucun identifiant permanent n’est fourni dans ce document.

## Essayer une commande

1. Ajouter un produit au panier puis « Tester la commande ».
2. Saisir uniquement des coordonnées fictives. Téléphone d’exemple : +221770000000.
3. Choisir une zone fictive, vérifier le récapitulatif serveur, confirmer la simulation.
4. Garder l’onglet ouvert : « Retrouver ma dernière confirmation » utilise son jeton privé. La référence seule ne donne pas accès à la commande. En cas de réponse perdue, ce bouton reprend la même demande, sans créer une nouvelle commande.
5. Aucun paiement ou envoi réel ne se produit.

## Administrer

Depuis `/admin` :

- **Catalogue & stock** : éditer, publier/archiver, choisir une photo fournie, créer une variante et son SKU. Les quantités sont initialement nulles ; ajuster le stock physique avec un motif. Impossible de descendre sous le stock réservé.
- **Commandes** : filtrer par état/référence ; consulter articles, coordonnées fictives, échéances et historique. Chaque transition exige une justification.
- **Livraison** (propriétaire) : créer, modifier ou désactiver une zone fictive. Les anciennes commandes gardent leurs frais.
- **Collecte** : après livraison, enregistrer séparément la collecte fictive avec référence. Propriétaire : remboursement fictif justifié, plafonné au total encaissé.
- **Expiration** : bouton de libération par lots de 100, également exécutée au prochain devis. Sans trafic ni intervention, pas de cron de fond.

En cas de conflit d’édition, actualiser avant de réessayer. Une annulation après expédition n’est pas autorisée : documenter l’échec de livraison puis le retour physique. Les retours après livraison sont un traitement manuel distinct, sans réécriture de la commande livrée.

## Arrêter la simulation

Remettre `CHECKOUT_MODE=disabled`, reconstruire/redémarrer l’application. La désactivation ne supprime pas les commandes ou audits. Ne pas vider une base partagée pour réinitialiser les essais.
