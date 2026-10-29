# Suivi — 29 octobre 2026

- Phase actuelle : 3, boutique de démonstration implémentée, en attente de revue utilisateur. Phase 4 non commencée.
- Autorisé : phases 1–3, comptes personnels GitHub/Vercel, catalogue fictif clairement signalé. Dépôt public provisoire accepté par l’utilisateur. Aucun abonnement payant ni déploiement production autorisé.
- Réalisé : socle Phase 2, accueil, catalogue avec recherche/filtres/tri/pagination, fiches et variantes, panier persistant avec prix et disponibilité recalculés côté serveur. Quatre produits photographiés, seed idempotent et exclusion des produits de démonstration en production.
- Git : branche feat/phase-3-storefront ; PR empilée sur feat/phase-2-foundation, car la PR #1 reste ouverte. main inchangée.
- Vérification locale : 19 tests unitaires, 8 tests PostgreSQL et dernière exécution Playwright réussie. Build, lint et types vérifiés. Captures desktop et mobile examinées ; absence de débordement contrôlée à 320/375/390/768/1440 px ; parcours clavier de base couvert.
- CI Phase 3 : résultat distant à consulter dans la PR après publication.
- Hébergement Phase 2 restant : connexion Vercel, choix d’offre sans engagement payant, PostgreSQL managé et recette distante. La poursuite locale de Phase 3 a été demandée malgré ce reliquat.
- Prochaine étape : revue de la boutique et validation explicite avant Phase 4 (administration, checkout et commandes).

## Limites de cette livraison

Prix et stocks fictifs, signalés comme démonstration. Aucune commande ni paiement possible ; aucun tarif de livraison inventé. CRUD administrateur et stockage objet reportés à Phase 4. WhatsApp affiché uniquement si un numéro est configuré. Aucun abonnement, aucune production modifiée, aucune URL Vercel créée. Récupération d’accès/MFA, recette WCAG complète, performances terrain et exploitation restent à finaliser. Les tests SQL de concurrence concernent le socle, pas un service de commande encore inexistant.
