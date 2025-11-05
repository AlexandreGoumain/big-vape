# Configuration de l'Upload d'Images Produits

Ce guide explique comment configurer l'upload d'images pour les produits en utilisant UploadThing.

## Prérequis

1. Créer un compte sur [UploadThing](https://uploadthing.com/)
2. Créer une nouvelle application dans le dashboard UploadThing
3. Récupérer les clés API (Secret et App ID)

## Configuration

### 1. Variables d'environnement

Créer un fichier `.env.local` à la racine du projet (ou mettre à jour le fichier existant) :

```env
UPLOADTHING_SECRET="votre_secret_ici"
UPLOADTHING_APP_ID="votre_app_id_ici"
```

### 2. Redémarrer le serveur de développement

Après avoir ajouté les variables d'environnement, redémarrer le serveur :

```bash
npm run dev
```

## Utilisation

### Créer un produit avec une image

1. Aller dans Dashboard > Produits > Créer un produit
2. Remplir les informations du produit
3. Dans la section "Image du produit", glisser-déposer une image ou cliquer pour sélectionner
4. L'image sera automatiquement uploadée vers UploadThing
5. L'URL de l'image sera enregistrée dans la base de données

### Modifier l'image d'un produit

1. Aller dans Dashboard > Produits > Sélectionner un produit
2. Dans la section "Image du produit", cliquer sur le bouton X pour supprimer l'image actuelle
3. Uploader une nouvelle image comme pour la création

## Limites

- Taille maximale : 4MB par image
- Format : Images uniquement (jpg, jpeg, png, gif, webp)
- Maximum 1 image par produit

## Architecture

### Fichiers créés

- `/lib/uploadthing.ts` - Configuration des composants UploadThing
- `/app/api/uploadthing/core.ts` - Configuration du serveur UploadThing
- `/app/api/uploadthing/route.ts` - Route handler API
- `/app/components/upload/ImageUpload.tsx` - Composant réutilisable d'upload

### Modifications apportées

- `/app/(dashboard)/dashboard/products/create/page.tsx` - Intégration du composant d'upload
- `/app/(dashboard)/dashboard/products/[id]/edit/page.tsx` - Intégration du composant d'upload
- `/next.config.mjs` - Ajout des domaines UploadThing dans les images autorisées

## Sécurité

- Seuls les utilisateurs avec le rôle ADMIN peuvent uploader des images
- L'authentification est vérifiée via NextAuth dans le middleware UploadThing
- Les fichiers sont stockés de manière sécurisée sur les serveurs UploadThing

## Dépannage

### "Unauthorized" lors de l'upload

Vérifier que :
- L'utilisateur est connecté
- L'utilisateur a le rôle ADMIN
- La session NextAuth est valide

### Images non affichées

Vérifier que :
- Les variables d'environnement sont correctement configurées
- Le domaine `utfs.io` est dans les `remotePatterns` de `next.config.mjs`
- Le serveur a été redémarré après modification de la configuration

### Erreur "Upload failed"

Vérifier que :
- Les clés API UploadThing sont valides
- La taille du fichier ne dépasse pas 4MB
- Le format du fichier est une image valide
