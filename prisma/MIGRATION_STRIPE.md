# Migration Prisma pour Stripe

## Changements au schéma

Les champs suivants ont été ajoutés au modèle `Order` :

```prisma
model Order {
  // ... champs existants ...

  paymentStatus         String      @default("unpaid") // unpaid, paid, refunded, failed
  stripeSessionId       String?     @unique
  stripePaymentIntentId String?
}
```

## Appliquer la migration

Pour appliquer ces changements à votre base de données :

```bash
# Créer et appliquer la migration
npx prisma migrate dev --name add_stripe_payment_fields

# Ou si vous préférez nommer autrement
npx prisma migrate dev --name stripe_integration

# Générer le client Prisma
npx prisma generate
```

## Vérification

Après la migration, vérifiez que les champs ont été ajoutés :

```bash
npx prisma studio
```

Ouvrez la table `Order` et vérifiez la présence des nouveaux champs.

## Rollback (si nécessaire)

Si vous devez annuler cette migration :

```bash
# Lister les migrations
npx prisma migrate status

# Réinitialiser à une migration précédente (ATTENTION: perte de données)
npx prisma migrate reset
```

## En production

Pour appliquer la migration en production :

```bash
# Ne pas utiliser migrate dev en production
npx prisma migrate deploy
```
