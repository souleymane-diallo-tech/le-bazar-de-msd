# Conventions du projet MSD

## Autorité et périmètre

Suivre la demande utilisateur et le découpage dans docs/roadmap.md. Phases 1 et 2 autorisées le 29 octobre 2026 ; les phases suivantes exigent l'accord utilisateur prévu dans le cahier des charges. Comptes personnels autorisés pour GitHub et Vercel ; aucun abonnement payant autorisé. Ne pas considérer les exemples, prix fictifs ou données d'images comme des informations commerciales validées.

## Architecture

Monolithe modulaire, TypeScript strict. Règles métier dans services serveur, validation Zod, autorisation systématique. Prix entiers XOF, dates UTC. Transactions et contraintes pour stock/commandes. Aucune confirmation de paiement issue du navigateur. Aucun module V2 dans le MVP.

## Git et secrets

Dépôt privé à créer en Phase 2. main stable, branches courtes et PR revues ; pas de push destructif. Aucun secret, donnée personnelle réelle ou dump de production dans Git. Déploiement production sur accord explicite.

## Vérification

Exécuter les contrôles adaptés : lint, types, build et tests significatifs pour le code concerné. Tests PostgreSQL pour concurrence et transactions. Responsive 320/375/390/768/1440 px et clavier. Ne jamais annoncer un test, déploiement ou critère comme validé sans preuve.

## Collaboration future

Pas d'agents parallèles tant que interfaces, schéma et règles Git ne sont pas stabilisés. Après autorisation : une branche/worktree par tâche, propriété exclusive des fichiers de migration, contrats partagés approuvés avant modifications croisées. Le responsable d'intégration effectue revue et fusion ; les agents ne changent pas le périmètre seuls.

## Suivi

Mettre à jour docs/status.md, backlog et ADR lors de toute décision structurante. Signaler hypothèses et limites, préserver les médias originaux, ne pas engager de coût ou activer un prestataire non validé.
