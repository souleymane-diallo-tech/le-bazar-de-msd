# Conventions du projet MSD

## Autorité et périmètre

Suivre la demande utilisateur et le découpage dans docs/roadmap.md. Phases 1, 2 et 3 autorisées le 29 octobre 2026 ; Phase 4 autorisée le 30 octobre 2026 ; Phase 5 autorisée le 31 octobre 2026. Zones et frais fictifs, expiration à 24 heures autorisés uniquement en démonstration. WhatsApp Business de test autorisé en base locale, jamais dans Git ; paiements mobiles reportés faute d’accès disponibles. Les phases 6 et suivantes exigent l'accord utilisateur prévu dans le cahier des charges. Données de démonstration autorisées pour les quatre produits, signalées et exclues de production. Comptes personnels autorisés pour GitHub et Vercel ; aucun abonnement payant autorisé. Ne pas considérer les exemples, prix fictifs ou données d'images comme des informations commerciales validées.

## Architecture

Import de photos autorisé le 19 novembre 2026 : une photo principale par produit, stockage local ignoré par Git ; restriction historique aux quatre photos levée pour cet incrément. Aucun service distant de stockage autorisé ni activé. WhatsApp de test maintenu en base locale, remplaçable dans les réglages.

Itération du 19 novembre 2026 autorisée : administration de démonstration, accès propriétaire temporaire local, recette catalogue/panier/commande et bouton WhatsApp validé par le client. Identifiants uniquement dans `.local/`, expiration sept jours. Aucun envoi automatique ni nouveau prestataire ; cette itération ne vaut pas lancement commercial.

Monolithe modulaire, TypeScript strict. Règles métier dans services serveur, validation Zod, autorisation systématique. Prix entiers XOF, dates UTC. Transactions et contraintes pour stock/commandes. Aucune confirmation de paiement issue du navigateur. Aucun module V2 dans le MVP.

## Git et secrets

Dépôt désormais public provisoirement à la demande de l'utilisateur. Ne pas modifier sa visibilité sans demande. main stable, branches courtes et PR revues ; pas de push destructif. Aucun secret, donnée personnelle réelle ou dump de production dans Git. Déploiement production sur accord explicite.

## Vérification

Exécuter les contrôles adaptés : lint, types, build et tests significatifs pour le code concerné. Tests PostgreSQL pour concurrence et transactions. Responsive 320/375/390/768/1440 px et clavier. Ne jamais annoncer un test, déploiement ou critère comme validé sans preuve.

## Collaboration future

Pas d'agents parallèles tant que interfaces, schéma et règles Git ne sont pas stabilisés. Après autorisation : une branche/worktree par tâche, propriété exclusive des fichiers de migration, contrats partagés approuvés avant modifications croisées. Le responsable d'intégration effectue revue et fusion ; les agents ne changent pas le périmètre seuls.

## Suivi

Mettre à jour docs/status.md, backlog et ADR lors de toute décision structurante. Signaler hypothèses et limites, préserver les médias originaux, ne pas engager de coût ou activer un prestataire non validé.

## Activation distante autorisée

La demande explicite de créer/connecter le stockage privé et déployer la démo, poursuivie le 20 novembre 2026, autorise Vercel Blob privé en Preview, les migrations Neon additives, le compte propriétaire distant de sept jours et le contact WhatsApp de test dans la base distante. Cette autorisation remplace les restrictions locales historiques ci-dessus pour cet incrément uniquement. Aucun abonnement payant, paiement réel ou lancement commercial.
