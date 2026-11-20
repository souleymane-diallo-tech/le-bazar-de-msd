# Paiements mobiles — état et reprise

État au 31 octobre 2026 : **reportés**, l’utilisateur confirme ne pas disposer d’accès marchand mobile pour le moment. Aucun appel fournisseur, clé, contrat, paiement test réel ou abonnement ajouté. Aucun adaptateur ni webhook n’est annoncé comme validé. Le checkout reste une simulation de paiement à la livraison.

## Sources officielles consultées

- [Wave Checkout](https://docs.wave.com/checkout) : accès via clés liées à un portefeuille Business ; gestion dans la section développeur du portail. Les opérations de création, lecture, recherche, expiration et remboursement sont documentées. Avant implémentation, confirmer avec Wave l’environnement de test réellement disponible pour ce compte et les mécanismes d’idempotence/rapprochement applicables ; ne pas supposer qu’un mode sandbox existe.
- [Wave Webhooks](https://docs.wave.com/webhook) : traitement des doublons, vérification de la signature et réponse HTTPS rapide. La signature des webhooks doit être distinguée de la signature des requêtes sortantes.
- [Orange Money Web Payment](https://developer.orange.com/apis/om-webpay?hl=fr-fr) : offre réservée aux marchands inscrits ; souscription et modalités auprès de l’opérateur local. Des essais avant mise en service sont prévus. Confirmer le contrat et l’API réellement provisionnés au Sénégal avant de choisir endpoints, authentification, notifications et rapprochement. Aucun protocole d’une autre offre ou d’un agrégateur ne doit être supposé compatible.

## Entrées nécessaires avant reprise

Compte marchand du client, offre/API et pays confirmés, documentation contractuelle disponible, environnement de test autorisé, modalités tarifaires validées, secrets transmis exclusivement au gestionnaire d’environnement, URL de webhook stable et stratégie de rotation. Aucun paiement réel même minime sans autorisation explicite.

## Recette exigée avant activation

1. Persister une tentative et sa référence avant tout appel réseau ; état initial en attente. Définir une reprise après réponse réseau ambiguë sans création aveugle d’un second débit.
2. Vérifier la notification selon le protocole officiel, sur corps brut ; contrôler commande, montant XOF, devise, référence et événement unique. Ne jamais confirmer depuis une URL de retour ou une valeur navigateur.
3. Tester doublons, signatures invalides, notifications désordonnées et concurrence avec expiration/annulation. Un paiement tardif sans réservation valide devient une anomalie à rapprocher, jamais une vente confirmée automatiquement.
4. Vérifier les remboursements, leurs références et leur cumul transactionnel. Conserver une piste d’audit sans secret ni payload client sensible.
5. Prévoir le rapprochement durable et la tâche planifiée authentifiée avant activation. Obtenir une nouvelle validation des coûts, du compte et de la recette.

Les scénarios T08 (paiement électronique concurrent) et T09 restent **non exécutés et bloqués par ces accès**, pas considérés passants par les tests du paiement à la livraison. Les enums/tables existants sont un socle de données, pas une intégration fonctionnelle.
