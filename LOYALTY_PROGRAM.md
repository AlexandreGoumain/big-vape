# Programme de Fidélité Big Vape

## Vue d'ensemble

Le programme de fidélité récompense les clients avec des points qui peuvent être échangés contre des avantages exclusifs.

## Comment gagner des points

### Achats
- **10 points par euro dépensé** sur chaque commande
- Les points sont automatiquement attribués lorsque le paiement est confirmé
- Montant minimum: 0€ (tous les achats comptent)

### Avis produits
- **50 points** pour chaque avis laissé sur un produit
- Un seul avis par produit et par utilisateur
- Points attribués immédiatement après la publication de l'avis

### Bonus d'inscription
- **100 points** offerts lors de la création du compte
- Bonus unique par utilisateur

## Niveaux de fidélité

Le système comprend 5 niveaux basés sur le total des points gagnés:

### 🎯 Membre (0-499 points)
- Accumulez des points à chaque achat

### 🥉 Bronze (500-1999 points)
- 5% de réduction sur toutes les commandes

### 🥈 Argent (2000-4999 points)
- 10% de réduction sur toutes les commandes
- Livraison gratuite

### ⭐ Or (5000-9999 points)
- 15% de réduction sur toutes les commandes
- Livraison gratuite
- Accès anticipé aux nouveautés

### 👑 Platine (10000+ points)
- 20% de réduction sur toutes les commandes
- Livraison gratuite
- Accès anticipé aux nouveautés
- Support prioritaire

## Catalogue de récompenses

### Créer des récompenses (Admin)

Utilisez l'API admin pour créer des récompenses:

```bash
POST /api/admin/rewards
Content-Type: application/json

{
  "title": "Titre de la récompense",
  "description": "Description détaillée",
  "pointsCost": 500,
  "type": "discount_percentage", // ou "discount_fixed", "free_shipping", "free_product"
  "value": 10, // Valeur du discount ou ID du produit
  "stock": 100, // null pour illimité
  "validDays": 30 // Jours de validité après obtention
}
```

### Types de récompenses

1. **discount_percentage**: Réduction en pourcentage
   - `value`: Pourcentage de réduction (ex: 10 pour 10%)

2. **discount_fixed**: Réduction fixe en euros
   - `value`: Montant en centimes (ex: 500 pour 5€)

3. **free_shipping**: Livraison gratuite
   - `value`: Non utilisé

4. **free_product**: Produit gratuit
   - `value`: ID du produit offert

### Exemples de récompenses recommandées

```json
[
  {
    "title": "5€ de réduction",
    "description": "Économisez 5€ sur votre prochaine commande",
    "pointsCost": 500,
    "type": "discount_fixed",
    "value": 500,
    "validDays": 30
  },
  {
    "title": "10% de réduction",
    "description": "10% de réduction sur votre prochaine commande",
    "pointsCost": 750,
    "type": "discount_percentage",
    "value": 10,
    "validDays": 30
  },
  {
    "title": "Livraison gratuite",
    "description": "Livraison offerte sur votre prochaine commande",
    "pointsCost": 300,
    "type": "free_shipping",
    "value": 0,
    "validDays": 30
  },
  {
    "title": "15% de réduction",
    "description": "15% de réduction sur votre prochaine commande",
    "pointsCost": 1200,
    "type": "discount_percentage",
    "value": 15,
    "validDays": 30
  },
  {
    "title": "20€ de réduction",
    "description": "Économisez 20€ sur votre prochaine commande",
    "pointsCost": 2000,
    "type": "discount_fixed",
    "value": 2000,
    "validDays": 30
  }
]
```

## Interface utilisateur

### Page de fidélité
Les utilisateurs peuvent accéder à leur programme de fidélité via:
- Menu compte → Programme de fidélité
- URL: `/account/loyalty`

La page affiche:
- Points actuels disponibles
- Total des points gagnés
- Niveau de fidélité actuel avec progression
- Avantages du niveau
- Récompenses actives (non utilisées, non expirées)
- Catalogue des récompenses disponibles
- Historique des transactions de points
- Guide "Comment gagner des points"

### Échange de récompenses
1. L'utilisateur clique sur "Échanger" pour une récompense
2. Les points sont déduits automatiquement
3. La récompense apparaît dans "Mes récompenses actives"
4. La récompense expire après le nombre de jours spécifié

## APIs disponibles

### Client

```bash
# Informations de fidélité de l'utilisateur
GET /api/loyalty

# Catalogue de récompenses
GET /api/loyalty/rewards

# Échanger des points contre une récompense
POST /api/loyalty/rewards
Body: { "rewardId": 1 }
```

### Admin

```bash
# Créer une récompense
POST /api/admin/rewards

# Lister toutes les récompenses
GET /api/admin/rewards

# Mettre à jour une récompense
PATCH /api/admin/rewards/[id]

# Supprimer une récompense
DELETE /api/admin/rewards/[id]
```

## Modèles de données

### LoyaltyTransaction
Historique de toutes les transactions de points (gains et dépenses).

### LoyaltyReward
Catalogue des récompenses disponibles à l'échange.

### UserReward
Récompenses obtenues par les utilisateurs.

### User
Champs ajoutés:
- `loyaltyPoints`: Points actuels disponibles
- `totalPointsEarned`: Total historique des points gagnés

## Intégration automatique

Les points sont automatiquement attribués:
- ✅ Lors du paiement d'une commande (webhook Stripe)
- ✅ Lors de la publication d'un avis produit
- ⚠️ Le bonus d'inscription doit être déclenché manuellement ou lors de la première connexion

## Migration de la base de données

Exécutez la migration pour créer les tables nécessaires:

```bash
npx prisma migrate dev --name add-loyalty-program
npx prisma generate
```

## Notes importantes

- Les points expirés ne sont pas encore implémentés (fonctionnalité future)
- Les récompenses utilisées restent en base de données pour l'historique
- Le système de niveaux est purement informatif (les réductions doivent être appliquées lors du checkout)
- Les récompenses avec stock limité se décrémentent automatiquement lors de l'échange
