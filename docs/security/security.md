# Sécurité et accès

## Permissions proposées

| Opération                               | Propriétaire                 | Gestionnaire | Public |
| --------------------------------------- | ---------------------------- | ------------ | ------ |
| Catalogue publié / commande invitée     | Oui                          | Oui          | Oui    |
| Catalogue interne et publication        | Oui                          | Oui          | Non    |
| Ajustement stock avec motif             | Oui                          | Oui          | Non    |
| Traitement commande/livraison           | Oui                          | Oui          | Non    |
| Enregistrer encaissement                | Oui                          | Oui          | Non    |
| Remboursement / correction encaissement | Oui                          | Non          | Non    |
| Paramètres commerciaux et zones         | Oui                          | Lecture      | Non    |
| Utilisateurs et rôles                   | Oui                          | Non          | Non    |
| Secrets paiement                        | Via infrastructure autorisée | Non          | Non    |
| Consultation audit                      | Oui                          | Non          | Non    |

Politique par défaut : refus. Vérification dans chaque service sensible, y compris actions serveur et endpoints, et pas seulement dans les pages. Pas d'inscription publique administrateur. Provisionnement initial du propriétaire par procédure contrôlée, jamais par mot de passe commité.

## Contrôles à implémenter

- Bibliothèque d'authentification maintenue ; session révocable, cookies Secure/HttpOnly/SameSite, protection CSRF/origine adaptée au mécanisme choisi.
- Rate limiting durable pour connexion, création commande et endpoints sensibles ; pas de simple compteur en mémoire des fonctions Vercel. Choisir mécanisme fournisseur ou stockage partagé en Phase 2.
- Checkout borné en nombre de lignes, quantité et longueur des champs ; validation serveur ; aucun HTML arbitraire dans les descriptions MVP.
- Confirmation via jeton aléatoire à forte entropie, haché en base ; pas de données personnelles dans les URL, logs ou pixels. Politique Referrer restrictive et aucun traceur sur la confirmation.
- Uploads autorisés, taille et formats limités, contrôle du contenu ; pas de SVG utilisateur actif au MVP. URLs signées à courte durée de vie.
- Secrets exclusivement dans les environnements ; aucune variable publique pour un secret ; comptes/clé distincts démo et production.
- Webhooks selon schéma de signature du fournisseur, tolérance temporelle et protection rejeu lorsque supportées ; aucun secret journalisé.
- Logs corrélés par identifiants techniques, téléphone/adresse masqués ; audit des prix, stocks, rôles, statuts et remboursements.
- Aucune mise en cache partagée des commandes, clients ou pages admin ; requêtes de confirmation hors indexation.
- Dépendances verrouillées ; correctifs de sécurité vérifiés avant livraison ; revue des autorisations et injections.

## Données et exploitation

Collecter uniquement ce qui sert à la vente/livraison. Durées de conservation, conditions de vente, confidentialité et obligations commerciales locales à fournir/valider avant production. Aucun avis juridique n'est affirmé par cette conception.

Sauvegardes base et protection des médias ; restauration testée dans une base isolée. Objectifs proposés : perte maximale de 24 h de données et restauration sous un jour ouvré, à confirmer selon le fournisseur et le besoin commercial.

Consentement : traceurs non essentiels désactivés avant accord ; refus et retrait possibles. Ne jamais envoyer téléphone, adresse ou instructions aux outils marketing. UTM validés et minimisés ; pas de conservation illimitée d'URL complètes.
