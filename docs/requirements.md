# Exigences et périmètre

Statut : proposition de Phase 1 ; consulter les décisions en attente avant implémentation.

| ID | Exigence | Critère vérifiable |
|---|---|---|
| R01 | Catalogue publié, catégories, recherche, tri, pagination | Un brouillon/produit archivé n'est jamais retourné au public ; combinaison recherche/catégorie/tri stable |
| R02 | Fiche et variantes | Prix, disponibilité, image et quantité correspondent à la variante choisie |
| R03 | Panier local persistant | Ajout, modification et suppression ; indisponibilité ou changement de prix signalé avant commande |
| R04 | Checkout invité | Nom, téléphone, zone, quartier, adresse/repère et instructions ; aucun compte requis |
| R05 | Total serveur | Sous-total + frais de zone ; aucun montant navigateur considéré comme autorité |
| R06 | Commande idempotente | Un même identifiant de soumission ne crée qu'une commande ; contenu différent rejeté |
| R07 | Stock cohérent | Pas de réservation supérieure au disponible, même sous concurrence |
| R08 | Administration | Toutes les lectures et mutations sensibles contrôlent session et permission au serveur |
| R09 | Opérations de vente | Transitions, expédition, annulation et encaissement historisés |
| R10 | Livraison Dakar | Seules zones actives proposées ; frais figés dans la commande |
| R11 | Marketing essentiel | Liens configurés, partage, métadonnées, sitemap et WhatsApp ; aucun faux lien |
| R12 | Accessibilité et responsive | Recette aux cinq largeurs, clavier et critères WCAG retenus |
| R13 | Paiements électroniques conditionnels | Confirmation serveur authentifiée, montant/devise/référence vérifiés, doublons sans effet |
| R14 | Exploitation | Sauvegarde restaurée en environnement isolé ; erreurs suivies sans secrets ni données excessives |

## Hypothèses de simplification à valider

- Une catégorie principale par produit ; une variante par défaut même sans option visible.
- Variantes simples décrites par attributs (couleur, taille) ; pas de configurateur.
- Un stock central, aucune vente en surcommande ; une expédition par commande.
- Aucun compte client, coupon, avis, abonnement, moteur de promotions ni paiement fractionné.
- Deux rôles fixes, sans éditeur de permissions.
- Clients issus des commandes ; aucun rapprochement automatique de personnes par téléphone seul.
- Prix commercial final fourni par le commerçant ; fiscalité et exigences de facturation à confirmer, sans calcul fiscal inventé.

## Contenu requis

Fichier produit : nom, description, catégorie, SKU, variantes, prix XOF, stock initial, images autorisées et statut. Paramètres : nom commercial, contact, WhatsApp, réseaux, zones/tarifs, délais annoncés, politiques de retour et de confidentialité.

Les quatre photos de produits sont des ressources de conception. Ni leurs caractéristiques techniques ni les prix ni les stocks ne sont déduits des images. La capture Shopify est une référence, pas un visuel produit réutilisable automatiquement.
