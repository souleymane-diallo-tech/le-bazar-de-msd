# ADR 010 — Import des photographies de produits

19 novembre 2026 : l’utilisateur autorise l’import de photos à la création et à la modification. Cela remplace la restriction précédente aux quatre photos fournies. Celles-ci restent disponibles et leurs originaux sont préservés.

Une photo principale par produit, miniature dans l’administration, choix entre photo existante et fichier importé. JPEG/PNG/WebP non animés, 3 Mo et 20 mégapixels maximum. Décodage réel puis orientation, réduction à 1600 px et réencodage WebP avec Sharp 0.35.5 ; métadonnées non conservées dans la version servie. Aucun nom de fichier utilisateur n’est utilisé comme chemin. Documentation : https://sharp.pixelplumbing.com/api-constructor/.

Stockage local `.local/product-images/`, hors Git, nom par empreinte SHA-256. Route contrôlée : seuls les produits publiés actifs sont publics ; une session administrateur valide permet de consulter les brouillons. Les fichiers non référencés ne sont pas servis. Les fichiers devenus inutilisés restent sur disque pour éviter une suppression prématurée de médias partagés ; nettoyage opérateur ultérieur après sauvegarde.

L’import est désactivé sur Vercel et hors environnement local développement/test. Aucun stockage payant ou nouveau prestataire activé. Avant un déploiement de cet incrément, choisir un stockage durable et migrer les fichiers avec leurs références. Les seuls fichiers locaux ne sont pas déployables tels quels.

Le WhatsApp de test fourni reste uniquement en base locale. Le propriétaire peut le remplacer dans **Contacts & visibilité** sans modifier le code ; les liens suivants et confirmations relues utilisent le réglage courant. Aucun message automatique.
