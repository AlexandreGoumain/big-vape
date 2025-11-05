# Configuration Stripe

Ce document explique comment configurer Stripe pour le système de paiement de Big Vape.

## 📋 Prérequis

- Un compte Stripe (https://dashboard.stripe.com/register)
- Node.js et npm installés
- Les packages `stripe` et `@stripe/stripe-js` (déjà installés)

## 🔑 Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...                    # Clé secrète Stripe (backend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Clé publique Stripe (frontend)
STRIPE_WEBHOOK_SECRET=whsec_...                  # Secret du webhook Stripe

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000        # URL de votre application
```

## 🚀 Configuration initiale

### 1. Créer un compte Stripe

1. Allez sur https://dashboard.stripe.com/register
2. Créez un compte
3. Activez le mode test pour le développement

### 2. Récupérer les clés API

1. Allez dans le Dashboard Stripe
2. Cliquez sur "Developers" → "API keys"
3. Copiez :
   - **Publishable key** (pk_test_...) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (sk_test_...) → `STRIPE_SECRET_KEY`

### 3. Configurer le webhook

1. Dans le Dashboard Stripe, allez dans "Developers" → "Webhooks"
2. Cliquez sur "Add endpoint"
3. Pour le développement local, utilisez Stripe CLI :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Ceci affichera le webhook secret à copier dans `STRIPE_WEBHOOK_SECRET`

4. Pour la production, ajoutez votre URL :
   ```
   https://votre-domaine.com/api/webhooks/stripe
   ```

5. Sélectionnez les événements à écouter :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

## 🗄️ Migration de la base de données

Appliquez la migration Prisma pour ajouter les champs Stripe :

```bash
npx prisma migrate dev --name add_stripe_fields
npx prisma generate
```

## 💳 Méthodes de paiement supportées

Stripe supporte automatiquement :
- ✅ **Cartes bancaires** (Visa, Mastercard, Amex, etc.)
- ✅ **PayPal** (via Stripe)
- ✅ **Google Pay**
- ✅ **Apple Pay**

Configuration dans le code (`app/api/checkout/route.ts:97`) :
```typescript
payment_method_types: ["card", "paypal"]
```

## 🧪 Mode Test

### Cartes de test Stripe

Pour tester les paiements :

**Paiement réussi :**
- Numéro : `4242 4242 4242 4242`
- Date : n'importe quelle date future
- CVC : n'importe quel 3 chiffres

**Paiement échoué :**
- Numéro : `4000 0000 0000 0002`

**3D Secure requis :**
- Numéro : `4000 0027 6000 3184`

Plus de cartes de test : https://stripe.com/docs/testing

## 📊 Flux de paiement

1. **Checkout** (`/checkout`)
   - L'utilisateur remplit ses informations de livraison
   - Création d'une adresse via `/api/addresses`

2. **Session Stripe** (`/api/checkout`)
   - Création d'une commande en DB avec `paymentStatus: "unpaid"`
   - Création d'une session Stripe Checkout
   - Redirection vers Stripe

3. **Paiement Stripe**
   - L'utilisateur paie sur la page Stripe
   - Support de CB, PayPal, etc.

4. **Webhook** (`/api/webhooks/stripe`)
   - Stripe envoie un événement `checkout.session.completed`
   - Mise à jour de la commande : `paymentStatus: "paid"`
   - Envoi des emails de confirmation
   - Vidage du panier

5. **Page de succès** (`/payment/success`)
   - Redirection après paiement
   - Vérification du statut via `/api/checkout/verify`
   - Affichage de la confirmation

## 🔒 Sécurité

- ✅ Les clés secrètes ne sont utilisées que côté serveur
- ✅ Les webhooks sont vérifiés avec la signature Stripe
- ✅ Les paiements sont gérés entièrement par Stripe (PCI-compliant)
- ✅ Aucune donnée de carte n'est stockée sur le serveur

## 📝 Logs et monitoring

Pour voir les événements Stripe en temps réel :
```bash
stripe logs tail
```

Dans le Dashboard Stripe :
- Allez dans "Developers" → "Events" pour voir tous les événements
- "Payments" pour voir tous les paiements

## 🌍 Production

Avant de passer en production :

1. **Activer le mode Live** dans Stripe
2. Récupérer les clés de production
3. Configurer le webhook de production
4. Mettre à jour les variables d'environnement
5. Activer les méthodes de paiement souhaitées
6. Vérifier la conformité PCI si nécessaire

## 🐛 Dépannage

### Le webhook ne fonctionne pas

- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- En local, utilisez Stripe CLI : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Vérifiez les logs dans "Developers" → "Webhooks" → "Webhook attempts"

### La redirection après paiement ne fonctionne pas

- Vérifiez que `NEXT_PUBLIC_APP_URL` est correct
- Les URLs de succès/annulation doivent être des URLs complètes

### Erreur "No such session"

- La session Stripe a peut-être expiré (24h)
- Vérifiez que le `sessionId` est correct

## 📚 Documentation

- [Documentation Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Documentation Webhooks](https://stripe.com/docs/webhooks)
- [API Reference](https://stripe.com/docs/api)

---

**Support :** Pour toute question, consultez la [documentation Stripe](https://stripe.com/docs) ou contactez le support Stripe.
