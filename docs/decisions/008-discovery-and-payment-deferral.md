# ADR 008 — Visibilité, WhatsApp et report des paiements mobiles

Date : 31 octobre 2026. Phase 5 autorisée explicitement. L’utilisateur fournit un numéro WhatsApp Business pour la démonstration locale et confirme qu’aucun accès au paiement mobile n’est disponible.

## Contacts et liens

Réglages publics dans `StoreSettings` existant, sans migration : WhatsApp et liens Facebook/Instagram/TikTok facultatifs. Modification réservée au propriétaire actif, validation Zod, contrôle de version et audit dans une transaction. Les valeurs de contact ne sont pas dupliquées dans le journal. Le numéro réel de test n’est présent ni dans le code, ni les fixtures, ni Git ; configuration opérateur dans la seule base locale autorisée. Aucun compte administrateur permanent créé.

Liens WhatsApp vers le numéro international normalisé, message encodé mentionnant produit/variante/référence et URL canonique sans paramètres ni fragment. Le produit fictif est signalé dans le message. Aucun appel API WhatsApp ni envoi automatique. La recette inspecte les liens sans les ouvrir. Liens sociaux HTTPS limités aux domaines des plateformes, sans identifiants, paramètres ou fragments ; aucune iframe, widget ou script tiers.

## SEO préparé, démonstration non indexable

Titres/descriptions, canonical, Open Graph et cartes de partage sur les pages publiques. Recherche/filtres du catalogue marqués noindex avec canonical vers le catalogue principal. Partage produit basé sur l’URL canonique, pas l’URL courante potentiellement porteuse de paramètres.

`SEO_INDEXING=disabled` par défaut. Activation refusée hors APP_ENV=production ou sur Preview ; aucun changement d’activation effectué. Robots et en-têtes restent noindex en démonstration, sitemap vide. Même en mode indexable, panier/checkout/admin/API/connexion et page de démonstration restent exclus. Sitemap limité aux pages publiques et produits publiés non fictifs ; JSON-LD Product seulement pour un produit réel dans un environnement indexable, sans prix, offre ni avis inventé. Échappement des chevrons pour éviter une fermeture de balise script.

L’activation future nécessite des paramètres identiques au build et au runtime, une reconstruction et une recette HTTP. L’indexation n’est pas une garantie de classement ni de résultat enrichi. Ne pas ouvrir l’indexation de ce projet de test.

## Marketing et paiements reportés

Aucun compte social ni identifiant marketing fourni ; seuls les réglages de liens sont prêts. Aucun pixel, analytics ou flux Meta activé ; aucun bandeau de consentement factice pour des traceurs inexistants. La page « À propos de cette démonstration » décrit le panier, le stockage temporaire de la confirmation, la session administrateur et l’absence de suivi publicitaire. Elle ne remplace pas les documents commerciaux du futur site.

Wave et Orange Money reportés sur confirmation utilisateur d’absence d’accès. Aucun adaptateur annoncé comme opérationnel, aucune route de webhook acceptant artificiellement un paiement, aucun bouton mobile. `PAYMENT_MODE=disabled` et rejet d’une activation prématurée conservés. Le paiement à la livraison **simulé** reste disponible. Conditions de reprise et sources officielles dans `docs/payments-readiness.md`.

## Limites et exploitation

Pas de coût, nouvelle dépendance, migration ni changement Vercel/Neon. Les phases 4–5 restent locales et en branches de revue empilées. Numéro du client, comptes sociaux, paramètres commerciaux, moyens de paiement et documents de lancement à finaliser avant production. Référencement et liens ne valent pas conformité juridique ni recette de vente réelle.
