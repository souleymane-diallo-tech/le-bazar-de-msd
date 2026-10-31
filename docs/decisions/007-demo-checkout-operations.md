# ADR 007 — Commandes et administration de démonstration

Date : 30 octobre 2026. Phase 4 autorisée explicitement, avec paramètres de livraison fictifs et expiration à 24 heures.

## Activation et isolement

`CHECKOUT_MODE=disabled` par défaut ; `demo` active le parcours uniquement hors `APP_ENV=production`. Paiements électroniques toujours désactivés. Produits, commandes et zones sont explicitement marqués comme démonstration. Les services de cette phase refusent les produits/zones non fictifs. Aucun abonnement, prestataire de paiement ou changement distant effectué pour développer cet incrément.

La migration `202610300001_demo_orders` ajoute deux booléens avec défaut false. Elle est additive, compatible avec l’application Phase 3. Seeds de zones : Dakar 1 500 XOF et périphérie 2 500 XOF, explicitement fictifs et jamais écrasés lors d’une relance.

## Devis et réservation

Devis calculé serveur, signé HMAC SHA-256 et valable 15 minutes. La soumission recalcule produits, variantes, prix et frais. Toute divergence ou expiration exige un nouveau devis. Une transaction PostgreSQL SERIALIZABLE crée client distinct, commande, snapshots, paiement COD en attente, expédition et réservations. Reprises bornées sur conflits sérialisables/unicité ; mise à jour versionnée du stock.

Clé d’idempotence distincte du jeton aléatoire d’accès (256 bits, seul son hash persiste en base). Même clé avec contenu/jeton différent : conflit. La confirmation publique expose référence, articles et montants, jamais adresse ou téléphone. Le jeton ne figure pas dans les URL. Le navigateur conserve temporairement la demande **fictive** dans sessionStorage pour récupérer une réponse perdue, puis uniquement référence/jeton après succès. Un panier ne réserve rien.

Origine de la requête contrôlée ; limite PostgreSQL de 30 requêtes checkout par minute et source. Sur Vercel, utilisation du [header de plateforme x-vercel-forwarded-for](https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for) ; en local, bucket commun. Les clés périmées de checkout sont supprimées après une heure. Cette limite n’est pas une protection DDoS complète.

## Traitement

À confirmer → confirmée → préparation → expédition → livrée/échec. Annulation avant expédition libère une seule fois. Expédition consomme stock physique et réservation. Réessai de livraison sans seconde consommation. Retour physique après échec réapprovisionne une fois ; la livraison n’enregistre jamais automatiquement de collecte.

Réservation non confirmée : 24 heures. Libération opportuniste au prochain devis et bouton administrateur, lots de 100. Les réservations confirmées n’expirent pas. Aucun cron activé : hors trafic, la libération attend le prochain passage ; une tâche planifiée authentifiée reste à prévoir avant exploitation réelle.

Collecte fictive saisie par gestionnaire après livraison, référence obligatoire et audit. Remboursement fictif réservé au propriétaire, idempotent et plafonné transactionnellement au montant encaissé. Correction d’adresse dans la même zone avant expédition, versionnée et auditée. Les tarifs et coordonnées snapshot restent indépendants des futures modifications du catalogue.

## Administration et limites

Identité relue côté serveur ; chaque mutation vérifie le rôle et l’activité dans la transaction. Édition produit/variante et ajustement stock protègent contre les versions périmées. Publication, archivage, catégories, sélection des quatre photographies fournies ; pas de suppression de produit lié à une commande. Le 31 octobre, l’utilisateur choisit explicitement de conserver ces quatre photos pour cette démo : import de nouvelles photos et stockage supplémentaire hors de cet incrément.

Dashboard : commandes à confirmer, livrées, collecte nette des remboursements. Clients distincts, aucun regroupement automatique par téléphone. Pages administratives non publiques. Aucun compte permanent créé par cet incrément. Les listes catalogue/catégories et derniers clients/audits sont volontairement bornées ; commandes paginées.

La phase ne constitue pas une recette de vente réelle. Paramètres commerciaux, récupération/MFA, stockage pour nouveaux médias, expiration planifiée et activation commerciale demeurent des prérequis distincts.
