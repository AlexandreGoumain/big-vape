# 🚀 Instructions de Setup - Programme de Fidélité

## ⚠️ IMPORTANT: Migrations de base de données requises

Les nouvelles fonctionnalités nécessitent des modifications de la base de données. Suivez ces instructions pour finaliser le setup.

## Option 1: Utiliser l'API de setup (Recommandé si serveur actif)

### Étapes:

1. **Démarrer le serveur Next.js:**
```bash
npm run dev
```

2. **Attendre que le serveur soit prêt** (environ 10-15 secondes)

3. **Appeler l'API de setup:**
```bash
curl -X POST http://localhost:3000/api/admin/setup-loyalty \
  -H "Content-Type: application/json" \
  -d '{"setupToken": "init-loyalty-2025"}'
```

Cette API va:
- ✅ Ajouter les champs `loyaltyPoints` et `totalPointsEarned` à la table User
- ✅ Créer la table ProductView (pour le tracking des vues)
- ✅ Créer la table Newsletter
- ✅ Créer les tables LoyaltyTransaction, LoyaltyReward, UserReward
- ✅ Insérer 8 récompenses initiales dans le catalogue

## Option 2: Exécution manuelle SQL (Si Prisma indisponible)

### Méthode A: Via interface phpMyAdmin/Adminer

1. **Connectez-vous à votre interface de gestion MySQL**
2. **Sélectionnez votre base de données**
3. **Ouvrez l'onglet SQL**
4. **Copiez-collez le contenu** du fichier `scripts/init-loyalty.sql`
5. **Exécutez** le script

### Méthode B: Via ligne de commande MySQL

```bash
# Remplacez DATABASE_NAME, USERNAME, PASSWORD par vos credentials
mysql -u USERNAME -p DATABASE_NAME < scripts/init-loyalty.sql
```

### Méthode C: Via Docker (si MySQL dans Docker)

```bash
docker exec -i mysql_container_name mysql -u root -p database_name < scripts/init-loyalty.sql
```

## Vérification du setup

### 1. Vérifier les tables créées

Connectez-vous à MySQL et exécutez:

```sql
SHOW TABLES LIKE '%Loyalty%';
SHOW TABLES LIKE 'ProductView';
SHOW TABLES LIKE 'Newsletter';
```

Vous devriez voir:
- `LoyaltyTransaction`
- `LoyaltyReward`
- `UserReward`
- `ProductView`
- `Newsletter`

### 2. Vérifier les récompenses

```sql
SELECT id, title, pointsCost, type FROM LoyaltyReward;
```

Vous devriez voir 8 récompenses.

### 3. Vérifier les champs User

```sql
DESCRIBE User;
```

Vous devriez voir les colonnes `loyaltyPoints` et `totalPointsEarned`.

## Régénérer le client Prisma

Une fois les tables créées, régénérez le client Prisma:

```bash
npx prisma generate
```

Si vous avez des erreurs de téléchargement, essayez:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

## Test des fonctionnalités

### 1. Programme de fidélité
- Accédez à http://localhost:3000/account/loyalty
- Vous devriez voir la page avec 0 points et les récompenses disponibles

### 2. Newsletter
- Allez sur la page d'accueil
- Vous devriez voir le formulaire d'inscription newsletter en bas

### 3. Historique des commandes
- Accédez à http://localhost:3000/account/orders
- Vous devriez voir vos commandes passées

### 4. Recommandations
- Ouvrez une page produit
- Scrollez en bas, vous devriez voir "Produits recommandés"

## Tester le gain de points

### Points sur commande
1. Passez une commande
2. Complétez le paiement (utilisez le mode test Stripe)
3. Une fois le paiement confirmé, vérifiez /account/loyalty
4. Vous devriez avoir gagné **10 points par euro** dépensé

### Points sur avis
1. Allez sur une page produit
2. Laissez un avis avec une note
3. Vérifiez /account/loyalty
4. Vous devriez avoir gagné **50 points**

### Bonus d'inscription
⚠️ Le bonus de 100 points à l'inscription n'est pas encore automatique.
Pour l'instant, créez-le manuellement via SQL:

```sql
-- Remplacez 'USER_ID' par l'ID d'un utilisateur
INSERT INTO LoyaltyTransaction (userId, points, type, description, createdAt)
VALUES ('USER_ID', 100, 'earned_signup', 'Bonus de bienvenue : 100 points', NOW());

UPDATE User
SET loyaltyPoints = loyaltyPoints + 100,
    totalPointsEarned = totalPointsEarned + 100
WHERE id = 'USER_ID';
```

## Troubleshooting

### Erreur: "Table already exists"
C'est normal si vous avez déjà exécuté le script. Les instructions SQL utilisent `CREATE TABLE IF NOT EXISTS`.

### Erreur: "Cannot add foreign key constraint"
Vérifiez que toutes les tables parentes existent (User, Product, etc.).

### Erreur Prisma: "@prisma/client did not initialize yet"
1. Arrêtez le serveur Next.js
2. Exécutez `npx prisma generate`
3. Redémarrez le serveur

### Les points ne s'attribuent pas
Vérifiez:
1. Que les tables sont bien créées
2. Que le webhook Stripe est configuré (voir STRIPE_SETUP.md)
3. Les logs du serveur pour voir les erreurs

## Structure des récompenses créées

| Titre | Points | Type | Valeur | Validité |
|-------|--------|------|--------|----------|
| 5€ de réduction | 500 | discount_fixed | 5€ | 30 jours |
| 10% de réduction | 750 | discount_percentage | 10% | 30 jours |
| Livraison gratuite | 300 | free_shipping | - | 30 jours |
| 15% de réduction | 1200 | discount_percentage | 15% | 30 jours |
| 10€ de réduction | 1000 | discount_fixed | 10€ | 30 jours |
| 20% de réduction | 2000 | discount_percentage | 20% | 45 jours |
| 20€ de réduction | 2000 | discount_fixed | 20€ | 45 jours |
| 25% de réduction VIP | 3000 | discount_percentage | 25% | 60 jours |

## Prochaines étapes

Une fois le setup terminé:

1. ✅ **Tester le flow complet** de fidélité
2. ✅ **Ajouter le bonus d'inscription automatique** (voir section ci-dessus)
3. ✅ **Créer des récompenses supplémentaires** via /api/admin/rewards
4. ✅ **Configurer les webhooks Stripe** si pas encore fait

## Support

Si vous rencontrez des problèmes:
1. Consultez les logs du serveur (`npm run dev`)
2. Vérifiez la console du navigateur
3. Consultez LOYALTY_PROGRAM.md pour la documentation complète
