# Direction visuelle et parcours

Statut : proposition à valider, identité non figée. [Planche de maquettes statiques](wireframes.svg).

## Identité

Nom provisoire : Le Bazar de MSD. Promesse proposée : « Des idées utiles pour votre quotidien ». Référence : esprit lifestyle de la capture, sans reprise de sa mise en page ni du casque présenté.

| Token            | Valeur proposée | Usage                                     |
| ---------------- | --------------- | ----------------------------------------- |
| Fond             | #F7F6F0         | Fond chaleureux                           |
| Surface          | #FFFFFF         | Cartes et champs                          |
| Texte            | #182D24         | Texte principal                           |
| Texte secondaire | #4D6056         | Aides et détails                          |
| Action           | #214C3B         | Bouton avec texte blanc                   |
| Sauge            | #DCE9D8         | Sections et accent, texte foncé           |
| Bordure          | #6F8175         | Champs interactifs ; contrastes à mesurer |
| Erreur           | #A52525         | Erreur avec texte et icône                |
| Focus            | #235EBA         | Contour clavier visible                   |

Typographies candidates : sans-serif système pour UI et texte ; Georgia pour titres éditoriaux. Cela permet une première version sans téléchargement de police. Corps 16 px minimum, interligne 1,5 ; titres mobiles 28–36 px, bureau 40–56 px.

Espacement : 4, 8, 12, 16, 24, 32, 48, 64 px. Marges mobiles 16 px, 12 px à 320 px si nécessaire. Largeur de lecture plafonnée. Rayon 12 px pour cartes et 8 px pour contrôles ; ombres discrètes.

## Composants

- En-tête : marque courte, panier avec quantité, recherche accessible ; menu mobile avec focus géré.
- Carte produit : image carrée sans déformation, nom sur deux lignes si besoin, prix FCFA, disponibilité ; pas d'avis ou de promotions inventés.
- Bouton principal : hauteur cible 48 px ; états normal, hover, focus, disabled, pending ; libellé d'action précis.
- Champ : label persistant, aide et erreur associées ; téléphone type tel, autocomplétion ; aucune information portée seulement par la couleur.
- Panier : quantités bornées, suppression annoncée, sous-total et indication claire des frais restant à calculer.
- Message : confirmation annoncée aux lecteurs d'écran, erreur conservant les saisies, rupture avec alternative vers catalogue.
- Icônes : ensemble unique, SVG de bibliothèque éprouvée ; nom accessible sur les boutons iconiques.

## Écrans de la planche

1. Accueil mobile : marque, recherche, promesse, catégories, produits. La photo du rangement peut servir au visuel principal si droits et cadrage validés.
2. Fiche mobile : photo, nom, prix réel à fournir, variante, quantité, livraison et ajout au panier ; contact WhatsApp secondaire.
3. Checkout mobile : coordonnées puis adresse, zone et frais, récapitulatif, paiement à la livraison, validation. Une colonne ; pas de compte ni de champ superflu.
4. Administration bureau : navigation simple, liste commandes et détail opérationnel. Sur mobile, liste en cartes et détail séparé plutôt que table compressée.

Les rectangles de la maquette sont des emplacements, pas des images finales. Les prix « à renseigner » évitent de fabriquer des données commerciales. Ces maquettes statiques ne prouvent ni responsive ni accessibilité de la future application.

## Responsive et feedback

320/375/390 px : une colonne pour checkout et fiches ; grille catalogue adaptée à la lisibilité, une colonne à 320 si nécessaire. 768 px : deux à trois produits ; 1440 px : quatre produits et fiche en deux colonnes. Aucun défilement horizontal de page.

États à concevoir : recherche vide, catalogue vide, panier vide, image absente, stock insuffisant, changement de prix, zone indisponible, paiement en attente, connexion expirée, erreur réseau et doublon de soumission.

Après ajout, annoncer l'action et afficher l'accès au panier. Après échec checkout, remonter à un résumé d'erreurs et conserver les valeurs non sensibles. Bouton en attente désactivé visuellement, mais seule l'idempotence serveur garantit l'absence de doublon.

## Médias fournis

| Fichier dans msf/                        | Usage candidat                                |
| ---------------------------------------- | --------------------------------------------- |
| 3f71de46-3b91-45a8-a3de-8a1f9710097a.JPG | Distributeur de savon                         |
| 04162f1e-58d1-49d1-8bb4-fa0f7b63c8dc.JPG | Rangement de salle de bain / visuel éditorial |
| 47142e48-f267-486d-a9c9-909cdd15c00d.JPG | Ventilateur portable                          |
| affa0f64-63ae-4081-be36-3c9f7474f47b.JPG | Horloge numérique                             |
| ff2a2182-678e-450e-83c9-5a8cfc0ba390.JPG | Référence de boutique uniquement              |

Optimisation et déclinaisons lors de l'implémentation, sans altérer les originaux. Vérifier droits, caractéristiques et composition des lots avant publication.
