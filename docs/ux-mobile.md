# Refonte UX mobile — interface par interface

Demande du 23 novembre 2026. Inspiration : recherche dominante, navigation par catégories, lecture rapide des prix et panier toujours accessible. L’identité verte et les photographies MSD restent conservées. Aucun avis, rabais, délai ou avantage commercial inventé.

## Itération 1 — Accueil et navigation partagée

Objectif : permettre de trouver un article dès l’arrivée, sans traverser une grande bannière. Recherche en haut de page, bannière compacte, trois univers, grille de deux produits sur téléphone et quatre sur ordinateur. Prix et disponibilité alignés ; explication de commande après les offres.

| Critère d’acceptation                                                | Vérification                                                     |
| -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Recherche visible sans défilement à 320, 375, 390, 768 et 1440 px    | Test mobile-home, cinq dimensions                                |
| Aucun défilement horizontal de la page                               | Foundation et mobile-home, cinq dimensions                       |
| Deux produits par rangée sur mobile, quatre sur grand écran          | Mesure des cartes et revue visuelle                              |
| Premier prix entièrement visible à 390 × 844                         | Assertion viewport, capture mobile                               |
| Recherche, bouton de recherche, panier et CTA principal ≥ 44 × 44 px | Mesures des zones interactives                                   |
| Panier visible après défilement vers les instructions                | Assertion viewport sur les cinq dimensions                       |
| Recherche au clavier et catégorie conduisent aux bons résultats      | Recherche « savon » : un produit ; salle de bain : deux produits |
| Navigation clavier et lien d’évitement utilisables                   | Parcours Tab/Entrée et test foundation                           |
| Démonstration et prix fictifs explicités                             | Revue visuelle, bandeau et texte près de la sélection            |

Tests : `tests/e2e/mobile-home.spec.ts` et tests accueil/évitement de `foundation.spec.ts`. Les captures privées sont `.local/ux-home-mobile.jpg` et `.local/ux-home-desktop.jpg`. Un premier passage en développement a dépassé les cinq secondes à l’ouverture du panier ; passage ciblé suivant réussi, sans modifier le délai d’assertion. Recette finale sur build compilé : six tests passants en 14,5 secondes, incluant la non-régression recherche/filtres et fiche/panier persistant/quantités/suppression de `storefront.spec.ts`. Lint, types et compilation Webpack réussis.

Limites : critères techniques et revue visuelle, pas encore de test avec des clients réels ni de mesure de conversion. Le seuil du premier prix concerne 390 × 844 ; les écrans plus petits peuvent demander un défilement. Le header est partagé : recherche/navigation bénéficient à toutes les pages, mais les autres interfaces ne sont pas encore refondues. Aucun nouveau service ou changement métier.

## Itération 2 — Catalogue

Accueil validé par l’utilisateur. Le catalogue reprend les cartes compactes et les alignements de l’accueil. Les champs recherche/catégorie sont repliables sur mobile, visibles à partir de 768 px ; le tri et le bouton Afficher restent accessibles. La validation est explicite pour éviter les navigations à chaque changement de champ. Les paramètres restent dans l’URL et les filtres actifs disposent de liens de suppression indépendants conservant le tri et remettant la pagination à 1.

| Critère d’acceptation                                                                                | Preuve prévue                                      |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Deux colonnes à 320/375/390/768, quatre à 1440 ; aucun débordement                                   | `mobile-catalog.spec.ts`, mesures de cartes        |
| Premier prix entièrement visible à 390 × 844, filtres repliés                                        | Assertion viewport et capture                      |
| Filtres ouvrables au clavier, état développé annoncé, champs masqués non accessibles avant ouverture | Entrée sur le bouton, aria-expanded et visibilité  |
| Champs et bouton Afficher d’au moins 44 px de hauteur                                                | Mesures aux cinq largeurs                          |
| Recherche et catégorie combinables, tri conservé après suppression d’un seul filtre                  | Recherche savon + salle de bain + prix décroissant |
| Retour navigateur depuis une fiche conserve URL, résultats et catégorie                              | Parcours fiche/rangements puis retour              |
| Recherche sans résultat et mot de 100 caractères sans débordement ; retour à toute la collection     | Parcours à 320 px                                  |
| État de chargement cohérent avec la grille responsive                                                | Revue visuelle du squelette                        |

Pas de modification des règles de recherche, prix, stocks ou pagination. Le retour testé est celui du navigateur ; la fiche produit fera l’objet de l’itération suivante. Captures privées : `.local/ux-catalog-mobile.jpg`, `.local/ux-catalog-filters.jpg`, `.local/ux-catalog-desktop.jpg`. Tous les critères ci-dessus sont vérifiés au 24 novembre : huit tests navigateur passants sur build compilé, lint/types/build réussis. Détails dans `status.md`.

## Itération 3 — Fiche produit (24 novembre)

Objectif : identifier l’article et son prix, choisir un modèle et ajouter au panier sans rechercher le bouton sur téléphone. Photo contenue sans recadrage, titre compact, prix dynamique, variantes avec mention d’épuisement, description après les choix. Quantité et action fixes sous 1024 px, espace réservé en bas du pied de page et marge de défilement pour les contrôles. La confirmation est amenée dans la zone visible après ajout ; partage et contact restent secondaires.

Critères : pas de débordement aux cinq largeurs ; prix visible à 390 × 844 ; bouton d’au moins 44 px visible avant et après défilement sur mobile ; quantité transmise au panier ; confirmation visible ; variante épuisée désactive quantité et ajout. Le retour explicite à la collection conserve les filtres et le tri grâce à un paramètre limité au chemin interne `/catalogue`. Une destination externe est ignorée. Tests dans `mobile-product.spec.ts`, régression catalogue dans `mobile-catalog.spec.ts` et règles de stock dans `storefront.spec.ts`.

Pas de paiement, commande ou notification déclenchés par cette recette. La sélection initiale reste le premier modèle comme auparavant. Les limites de stock et les prix serveur sont inchangés.

Recette terminée : treize scénarios passants, dont recherche/tri après attente explicite de la fin de navigation dans le test. Build/TypeScript et lint réussis. Revue visuelle mobile et ordinateur ; captures `.local/ux-product-mobile.jpg` et `.local/ux-product-desktop.jpg`. Validation utilisateur et tests avec des clients réels restent distincts de cette recette technique.

## Interfaces restantes

1. **Panier** : modification simple, total explicite, CTA de commande ; vérifier suppression, stock modifié, panier vide et persistance.
2. **Commande et confirmation** : champs regroupés, erreurs près des champs, frais avant validation, prévention des doublons et statut compréhensible ; vérifier clavier mobile, reprise après erreur et consentement WhatsApp facultatif.
3. **Administration** : tableau de commandes prioritaire, statuts lisibles, recherche et actions adaptées au mobile ; formulaire produit progressif avec photo, prix, stock et validation ; vérifier accès, erreurs, sauvegarde et prévention de perte des modifications.

Pour chaque interface : établir les critères avant modification, implémenter, vérifier les cinq largeurs et les états d’erreur pertinents, consigner les preuves et présenter l’aperçu avant l’itération suivante. Ne pas annoncer une amélioration d’adoption sans observation utilisateur.
