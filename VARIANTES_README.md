# 🎨 Système de Variantes de Produits - Big Vape

## 📋 Vue d'ensemble

Ce système de variantes permet de gérer différentes versions d'un même produit (couleurs, tailles, contenances) avec une expérience utilisateur premium digne des meilleurs sites de vape au monde.

## ✨ Fonctionnalités

### Pour les clients :
- ✅ Sélecteur de couleurs avec effets visuels premium
- ✅ Sélecteur de tailles/contenances moderne
- ✅ Galerie d'images avec transitions fluides
- ✅ Mise à jour dynamique du prix selon la variante
- ✅ Indicateur de stock en temps réel
- ✅ Animations et effets de glow
- ✅ Design glassmorphism et gradients modernes

### Pour les administrateurs :
- ✅ Interface de gestion des variantes intuitive
- ✅ Génération automatique de SKU
- ✅ Gestion du stock par variante
- ✅ Ajustement du prix par variante
- ✅ Upload d'images spécifiques par variante
- ✅ Définition d'une variante par défaut

## 🚀 Installation

### Étape 1 : Exécuter la migration SQL

**IMPORTANT** : Avant d'utiliser le système de variantes, vous devez exécuter la migration SQL.

```bash
# Se connecter à la base de données MySQL
mysql -u votre_utilisateur -p votre_base_de_donnees

# Exécuter le fichier de migration
source prisma/migrations/add_product_variants.sql
```

Ou directement :

```bash
mysql -u votre_utilisateur -p votre_base_de_donnees < prisma/migrations/add_product_variants.sql
```

### Étape 2 : Générer le client Prisma

```bash
npx prisma generate
```

### Étape 3 : Redémarrer le serveur de développement

```bash
npm run dev
```

## 📊 Structure de la base de données

### Table `ProductVariant`

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | ID auto-incrémenté |
| productId | INT | Référence au produit parent |
| sku | VARCHAR | SKU unique de la variante |
| name | VARCHAR | Nom de la variante (ex: "Bleu Glacier - 50ml") |
| color | VARCHAR | Couleur (ex: "Bleu Glacier" ou "#0066CC") |
| size | VARCHAR | Taille/contenance (ex: "50ml", "100ml") |
| priceAdjustment | INT | Ajustement du prix en centimes (peut être positif ou négatif) |
| stock | INT | Stock disponible pour cette variante |
| image | VARCHAR | URL de l'image spécifique à la variante |
| isDefault | BOOLEAN | Indique si c'est la variante par défaut |
| createdAt | DATETIME | Date de création |
| updatedAt | DATETIME | Date de mise à jour |

### Modifications sur `CartItem` et `OrderItem`

- Ajout de `variantId` (nullable) pour lier à une variante spécifique
- Ajout de `variantName` sur `OrderItem` pour capturer le nom au moment de l'achat
- Contrainte unique mise à jour sur `CartItem` : `[cartId, productId, variantId]`

## 🎯 Utilisation

### Côté Admin

1. **Créer ou éditer un produit**
2. **Utiliser le composant VariantManager** (à intégrer dans le formulaire produit)
3. **Ajouter des variantes** avec :
   - Nom descriptif
   - SKU (peut être généré automatiquement)
   - Couleur (nom ou code hex)
   - Taille/contenance
   - Ajustement de prix (optionnel)
   - Stock
   - Image (optionnelle)
   - Marquer comme variante par défaut

### Côté Client

Le système détecte automatiquement si un produit a des variantes et affiche :
- **VariantSelector** : Sélecteurs de couleur et taille avec effets premium
- **VariantImageGallery** : Galerie d'images avec navigation fluide
- **Prix dynamique** : Mise à jour automatique selon la variante sélectionnée
- **Stock dynamique** : Affichage du stock de la variante sélectionnée

## 🎨 Composants UI

### `VariantSelector`

Composant premium pour sélectionner une variante :

```tsx
<VariantSelector
  variants={product.variants}
  basePrice={product.price}
  onVariantChange={(variant) => setSelectedVariant(variant)}
/>
```

**Caractéristiques** :
- Cercles de couleur avec effet glow au survol
- Boutons de taille avec animations
- Affichage du prix avec gradient animé
- Indicateur de stock avec pulsation
- Informations sur la variante sélectionnée

### `VariantImageGallery`

Galerie d'images avec transitions fluides :

```tsx
<VariantImageGallery
  images={availableImages}
  productName={product.title}
/>
```

**Caractéristiques** :
- Navigation avec boutons et miniatures
- Transitions fluides entre images
- Indicateur de position
- Badge "Premium" sur la première image
- Responsive design

### `VariantManager` (Admin)

Interface de gestion des variantes :

```tsx
<VariantManager
  productId={product.id}
  basePrice={product.price}
  onVariantsChange={(variants) => handleVariantsChange(variants)}
  initialVariants={product.variants}
/>
```

## 🛠 API Endpoints

### Variantes par produit

```
GET /api/products/:id/variants
POST /api/products/:id/variants
```

**POST Body (création simple)** :
```json
{
  "name": "Bleu Glacier - 50ml",
  "sku": "VAP-BLU-50ML-ABC123",
  "color": "#0066CC",
  "size": "50ml",
  "priceAdjustment": 0,
  "stock": 100,
  "image": "https://...",
  "isDefault": true
}
```

**POST Body (création multiple)** :
```json
[
  {
    "name": "Rouge - 50ml",
    "color": "#CC0000",
    "size": "50ml",
    ...
  },
  {
    "name": "Bleu - 50ml",
    "color": "#0000CC",
    "size": "50ml",
    ...
  }
]
```

### Variante spécifique

```
GET /api/variants/:id
PUT /api/variants/:id
DELETE /api/variants/:id
```

## 📦 Service Layer

### `variantService.ts`

Fonctions disponibles :

- `getVariantsByProductId(productId)` - Récupère toutes les variantes d'un produit
- `getVariantById(id)` - Récupère une variante
- `getDefaultVariant(productId)` - Récupère la variante par défaut
- `createVariant(data)` - Crée une variante
- `createVariants(productId, variants)` - Crée plusieurs variantes
- `updateVariant(id, data)` - Met à jour une variante
- `updateVariantStock(id, stock)` - Met à jour le stock
- `deleteVariant(id)` - Supprime une variante
- `getVariantPrice(variantId)` - Calcule le prix final
- `isVariantAvailable(variantId, quantity)` - Vérifie la disponibilité
- `generateSKU(productId, color, size)` - Génère un SKU unique

## 🎨 Animations CSS

Le système utilise des animations CSS personnalisées :

- `animate-gradient` - Animation de gradient pour les prix
- `animate-glow` - Effet de glow pulsant
- `animate-slide-up` - Animation d'apparition
- `animate-scale-in` - Animation de scale

Ces animations sont définies dans `app/globals.css`.

## 🛒 Panier et Commandes

### CartContext mis à jour

Le contexte de panier gère maintenant les variantes :

```tsx
interface CartItem {
  id: number;
  productId: number;
  variantId?: number;          // Nouveau
  variantName?: string;         // Nouveau
  title: string;
  price: number;
  image?: string;
  quantity: number;
}
```

**Important** :
- Les articles avec des variantes différentes sont traités comme des articles distincts
- Le panier utilise `[productId, variantId]` comme clé unique

## 🎯 Bonnes pratiques

1. **SKU** : Toujours générer un SKU unique pour chaque variante
2. **Variante par défaut** : Définir une variante par défaut pour chaque produit avec variantes
3. **Images** : Fournir une image spécifique pour chaque variante si possible
4. **Prix** : Utiliser `priceAdjustment` pour les variations de prix (en centimes)
5. **Stock** : Gérer le stock par variante, pas au niveau du produit

## 🚧 Migration depuis l'ancien système

Si vous avez des produits existants :

1. Les produits sans variantes continuent de fonctionner normalement
2. Le stock global du produit est utilisé si pas de variantes
3. Pour migrer un produit vers des variantes :
   - Créer les variantes avec le stock approprié
   - Le système basculera automatiquement sur le stock des variantes

## 🐛 Dépannage

### Les variantes ne s'affichent pas

1. Vérifier que la migration SQL a bien été exécutée
2. Vérifier que `npx prisma generate` a été lancé
3. Redémarrer le serveur de développement

### Erreur "SKU already exists"

- Chaque SKU doit être unique dans toute la base
- Utiliser la fonction `generateSKU()` pour garantir l'unicité

### Le panier ne gère pas correctement les variantes

- Vérifier que `variantId` est bien passé lors de l'ajout au panier
- Vérifier que le localStorage a été vidé (ancien format)

## 📈 Améliorations futures possibles

- [ ] Combinaisons de variantes (ex: Rouge + 50ml, Rouge + 100ml)
- [ ] Import/export CSV des variantes
- [ ] Duplication de variantes
- [ ] Historique des prix par variante
- [ ] Alertes de stock faible par variante
- [ ] Statistiques de vente par variante

## 💬 Support

Pour toute question ou problème :
1. Consulter ce README
2. Vérifier les logs du serveur
3. Vérifier la console du navigateur
4. Contacter l'équipe de développement

---

**Développé avec ❤️ pour Big Vape**
*Système de variantes premium pour dominer la concurrence !*
