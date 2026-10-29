# ADR 002 — Cohérence commande, stock et paiement

Statut : proposé. Date : 2026-10-29.

Décision : commande et réservation dans une transaction locale ; appels prestataires hors transaction ; événements idempotents et rapprochement. Séparer les statuts de commande, paiement et livraison. Consommer stock à l'expédition et rapprocher encaissement indépendamment.

Alternatives rejetées : confiance dans le retour navigateur ; décrémentation de stock sans réservation ; statut unique « terminé » regroupant livraison et paiement.

Conséquences : tables Reservation, PaymentEvent et Refund justifiées dès V1 ; tâche d'expiration et procédure de paiement tardif nécessaires. Paiement à la livraison disponible au lancement ; intégrations conditionnelles.

À valider : délai de confirmation proposé de 24 h, responsabilité de collecte et droits de remboursement.
