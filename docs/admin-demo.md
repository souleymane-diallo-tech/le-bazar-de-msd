# Guide de la phase 4 — démonstration locale

## Accès temporaire — 19 novembre 2026

Ouvrir `http://localhost:3000/connexion`. Identifiants locaux dans `.local/acces-admin-temporaire.md` (privé, ignoré par Git). Accès propriétaire valable sept jours ; date UTC dans le fichier et le tableau de bord. L’expiration retire aussi les droits des sessions ouvertes. Cet accès n’existe pas sur Vercel.

Parcours : créer un brouillon dans **Catalogue & stock**, ajouter variante et prix, ajuster le stock avec un motif, puis publier. Vérifier la fiche publique, ajouter au panier et placer une commande fictive. **Envoyer le récapitulatif sur WhatsApp** prépare le message ; appuyer ensuite sur Envoyer dans WhatsApp. Dans **Commandes**, vérifier la référence et traiter la demande. L’ouverture de WhatsApp ne prouve ni réception ni paiement.

Recherche et pages de vingt produits disponibles. Archiver retire le produit de la boutique en conservant les commandes.

## Importer une photo

Dans la création ou modification d’un produit, **Importer une photo du produit**, puis enregistrer. Formats JPEG, PNG et WebP non animés, 3 Mo maximum et 20 mégapixels. La photo importée remplace la sélection existante ; sans nouveau fichier, celle-ci est conservée. Une miniature apparaît dans la liste. Renseigner sa description accessible. Les quatre photos initiales restent sélectionnables.

Les images importées restent sur cet ordinateur dans `.local/product-images/`, hors Git. Sauvegarder ce dossier avec la base pour conserver les références. Import non disponible sur Vercel avant configuration d’un stockage distant durable. Une photo principale par produit dans cette itération.

Pour changer le destinataire WhatsApp : **Contacts & visibilité**, modifier le numéro international puis **Enregistrer les contacts publics**. Le numéro fourni pour les essais est déjà configuré ; aucun changement de code requis.

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

## Contacts et visibilité (phase 5)

Le propriétaire accède à `/admin/parametres`. WhatsApp accepte un numéro international avec indicatif ; un champ vide masque le lien. Les profils sociaux doivent être des liens HTTPS de plateforme sans paramètres ni fragment. Les valeurs enregistrées sont publiques sur la boutique ; aucune coordonnée réelle ne doit être ajoutée au dépôt Git. Le numéro de test fourni par l’utilisateur est configuré seulement dans la base locale.

La page `/contact` et les fiches préparent des liens WhatsApp, sans envoyer de message automatiquement. Pour tester, inspecter le numéro et le texte puis utiliser le lien manuellement si souhaité. L’indexation reste désactivée ; Wave/Orange Money et les traceurs publicitaires restent absents. Le remplacement du numéro par celui du client se fait dans le même formulaire propriétaire.

## Arrêter la simulation

Remettre `CHECKOUT_MODE=disabled`, reconstruire/redémarrer l’application. La désactivation ne supprime pas les commandes ou audits. Ne pas vider une base partagée pour réinitialiser les essais.
