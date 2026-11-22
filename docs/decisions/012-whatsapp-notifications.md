# ADR 012 — Notifications WhatsApp automatiques

Date : 22 novembre 2026. Statut : implémentation de démonstration autorisée.

## Décision

Utiliser directement Meta WhatsApp Cloud API, sans prestataire supplémentaire payant. Une notification est créée dans la même transaction PostgreSQL que la commande (unicité commande/type). Le checkout réussit indépendamment du transport. Vercel Queues transporte uniquement son identifiant ; une tâche Schedules toutes les quinze minutes reprend les notifications non publiées. Le délai Hobby peut inclure quinze minutes de variation.

Le message français contient référence, quantité, total, zone et lien vers l’administration authentifiée. Aucun nom, adresse, téléphone client ni jeton de confirmation privée n’est transmis. Le destinataire vient des réglages ; un changement de numéro bloque les anciens envois plutôt que de les rediriger silencieusement. Le consentement du gérant est requis avant activation.

## Livraison et sécurité

Modes `disabled`, `simulated`, `meta`, désactivé par défaut. Une prise atomique empêche deux workers d’envoyer simultanément. Seul un refus HTTP 429 est retenté automatiquement, cinq tentatives maximum. Un timeout, une réponse ambiguë ou un worker disparu devient « À vérifier avant renvoi » : aucun renvoi aveugle, car Meta peut avoir reçu le premier appel. Ce choix privilégie l’absence de doublons à une promesse de livraison exactement une fois.

Les callbacks utilisent la signature HMAC de Meta, le compte et le numéro émetteur attendus. Les statuts ne régressent pas lorsque des callbacks sont répétés ou désordonnés. Une acceptation API n’est pas une preuve de livraison ; seuls les callbacks permettent de marquer livré/lu. Les erreurs techniques exposées dans l’administration sont des codes, sans réponse brute du fournisseur. Les droits propriétaire sont nécessaires pour relancer un échec non accepté.

## Exploitation

La démo utilise le compte de test Meta et un destinataire vérifié. Le modèle `msd_order_created` français est soumis en catégorie UTILITY ; l’activation exige son approbation. Le token de test est temporaire, conservé en secret Preview ; son renouvellement et un accès serveur durable seront nécessaires avant exploitation continue. Aucun abonnement, compte de paiement ni lancement commercial n’est autorisé par cet incrément.

Les anciennes commandes ne sont pas notifiées rétroactivement. Une notification simulée ne sera jamais convertie automatiquement en envoi réel. La désactivation conserve les commandes et le bouton manuel existant pour les nouvelles commandes. Les variables et callbacks doivent être vérifiés sur le déploiement avant bascule de l’alias public.

Sources : [Meta templates](https://developers.facebook.com/docs/graph-api/reference/whats-app-business-account/message_templates/), [Vercel Queues](https://vercel.com/docs/queues), [Schedules configuration](https://vercel.com/docs/schedules/configuration), [Schedules limits](https://vercel.com/docs/schedules/limits).
