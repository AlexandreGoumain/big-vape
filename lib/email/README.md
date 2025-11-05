# Système de Notifications Email - Big Vape

Ce dossier contient l'implémentation complète du système de notifications email pour l'application Big Vape.

## 📦 Technologies utilisées

- **[Resend](https://resend.com/)** - Service d'envoi d'emails moderne et fiable
- **[React Email](https://react.email/)** - Création de templates d'emails avec React
- **[@react-email/components](https://react.email/docs/components/html)** - Composants React pour emails

## 🎯 Fonctionnalités implémentées

### 1. Email de confirmation de commande
- **Trigger**: Automatiquement envoyé après la création d'une commande
- **Destinataire**: Client
- **Contenu**:
  - Numéro de commande
  - Liste des articles commandés avec images
  - Total de la commande
  - Adresse de livraison
  - Méthode de paiement

### 2. Email de bienvenue
- **Trigger**: Automatiquement envoyé après l'inscription d'un nouvel utilisateur
- **Destinataire**: Nouvel utilisateur
- **Contenu**:
  - Message de bienvenue personnalisé
  - Liste des fonctionnalités du compte
  - Bouton CTA pour commencer les achats

### 3. Email de mise à jour de statut de commande
- **Trigger**: Envoyé lorsqu'un admin met à jour le statut d'une commande
- **Destinataire**: Client
- **Statuts supportés**:
  - `processing` - En cours de traitement
  - `shipped` - Expédiée
  - `delivered` - Livrée
  - `cancelled` - Annulée

### 4. Email de vérification d'email
- **Trigger**: Envoyé sur demande via l'API `/api/auth/send-verification`
- **Destinataire**: Utilisateur non vérifié
- **Contenu**:
  - Lien de vérification sécurisé
  - Expiration après 24 heures

### 5. Notification admin pour nouvelle commande
- **Trigger**: Automatiquement envoyé après la création d'une commande
- **Destinataire**: Administrateur
- **Contenu**:
  - Résumé de la commande
  - Informations du client
  - Détails des articles

## 📁 Structure du dossier

```
lib/email/
├── README.md                           # Ce fichier
├── client.ts                           # Configuration du client Resend
├── services.ts                         # Fonctions d'envoi d'emails
├── index.ts                            # Export des services
└── templates/                          # Templates React Email
    ├── OrderConfirmationEmail.tsx      # Template de confirmation de commande
    ├── WelcomeEmail.tsx                # Template de bienvenue
    ├── OrderStatusUpdateEmail.tsx      # Template de mise à jour de statut
    └── EmailVerificationEmail.tsx      # Template de vérification d'email
```

## ⚙️ Configuration

### Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env`:

```env
# Clé API Resend (obtenir sur https://resend.com/)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email d'expéditeur (doit être vérifié sur Resend)
EMAIL_FROM="Big Vape <noreply@big-vape.fr>"

# Email de l'administrateur pour les notifications
ADMIN_EMAIL="admin@big-vape.fr"

# URL de l'application (pour les liens dans les emails)
NEXTAUTH_URL="http://localhost:3000"
```

### Configuration de Resend

1. Créer un compte sur [resend.com](https://resend.com/)
2. Vérifier votre domaine d'envoi (ou utiliser le domaine de test pour le développement)
3. Générer une clé API
4. Ajouter la clé API dans `.env`

**Note pour le développement**: Resend fournit un domaine de test `onboarding@resend.dev` que vous pouvez utiliser sans vérifier votre propre domaine.

## 🚀 Utilisation

### Importer les services

```typescript
import {
  sendOrderConfirmationEmail,
  sendWelcomeEmail,
  sendOrderStatusUpdateEmail,
  sendEmailVerification,
  sendAdminOrderNotification,
} from '@/lib/email';
```

### Envoyer un email de confirmation de commande

```typescript
await sendOrderConfirmationEmail({
  orderNumber: 12345,
  customerName: 'Jean Dupont',
  customerEmail: 'jean@example.com',
  orderDate: new Date(),
  orderItems: [
    {
      product: {
        title: 'Cigarette électronique',
        image: 'https://...',
      },
      quantity: 2,
      price: 4990, // en centimes
    },
  ],
  total: 9980, // en centimes
  shippingAddress: {
    street: '123 rue de la Paix',
    city: 'Paris',
    state: 'Île-de-France',
    zipCode: '75001',
    country: 'France',
  },
  paymentMethod: 'Carte bancaire',
});
```

### Envoyer un email de bienvenue

```typescript
await sendWelcomeEmail({
  firstName: 'Jean',
  email: 'jean@example.com',
});
```

### Envoyer un email de mise à jour de statut

```typescript
await sendOrderStatusUpdateEmail({
  orderNumber: 12345,
  customerName: 'Jean Dupont',
  customerEmail: 'jean@example.com',
  status: 'shipped',
  previousStatus: 'processing',
});
```

### Envoyer un email de vérification

```typescript
await sendEmailVerification({
  firstName: 'Jean',
  email: 'jean@example.com',
  verificationToken: 'abc123...',
});
```

## 🔌 API Routes

### POST /api/auth/send-verification
Envoie un email de vérification à l'utilisateur connecté.

**Authentification**: Requise

**Réponse**:
```json
{
  "message": "Verification email sent successfully"
}
```

### GET /api/auth/verify-email?token=xxx
Vérifie l'email avec le token fourni.

**Authentification**: Non requise

**Réponse**:
```json
{
  "message": "Email vérifié avec succès",
  "user": {
    "id": "...",
    "email": "...",
    "emailVerified": "2024-01-01T00:00:00.000Z"
  }
}
```

### PATCH /api/orders/[id]
Met à jour le statut d'une commande et envoie un email de notification.

**Authentification**: Requise (admin uniquement)

**Body**:
```json
{
  "status": "shipped"
}
```

**Statuts valides**: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

## 🎨 Personnalisation des templates

Les templates sont créés avec React Email et peuvent être facilement personnalisés. Chaque template est un composant React situé dans `templates/`.

### Structure d'un template

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
} from '@react-email/components';

interface MyEmailProps {
  name: string;
}

export const MyEmail = ({ name }: MyEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading>Bonjour {name}!</Heading>
          <Text>Votre contenu ici...</Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles en ligne requis pour la compatibilité email
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
};
```

### Prévisualiser les templates

Pour prévisualiser les templates pendant le développement, vous pouvez utiliser le serveur de développement de React Email:

```bash
npx react-email dev
```

Cela ouvrira un navigateur avec tous vos templates prévisualisés.

## 🐛 Gestion des erreurs

Tous les services d'envoi d'emails retournent un objet avec `success` et potentiellement `error`:

```typescript
const result = await sendWelcomeEmail({ ... });

if (!result.success) {
  console.error('Failed to send email:', result.error);
  // Gérer l'erreur (retry, log, etc.)
}
```

**Important**: Les envois d'emails ne bloquent jamais les opérations critiques (création de commande, inscription, etc.). Les erreurs sont loggées mais n'empêchent pas l'opération principale de se terminer avec succès.

## 📊 Monitoring et logs

Tous les envois d'emails sont loggés dans la console:
- ✅ Succès: `Email [type] envoyé avec succès: { id: '...' }`
- ❌ Erreur: `Erreur lors de l'envoi de l'email [type]: { error }`

Pour un monitoring en production, considérez:
- Intégrer un service de logging (Sentry, LogRocket, etc.)
- Créer une table `EmailLog` dans la base de données
- Utiliser les webhooks de Resend pour le suivi des deliveries/bounces

## 🔒 Sécurité

- ✅ Les clés API sont stockées en variables d'environnement
- ✅ Les tokens de vérification expirent après 24h
- ✅ Les tokens utilisés sont supprimés de la DB
- ✅ Validation des emails avant envoi
- ✅ Protection CSRF via NextAuth
- ✅ Routes admin protégées par middleware

## 🚨 Limitations

- **Rate limiting**: Resend a des limites selon votre plan
  - Free tier: 100 emails/jour
  - Paid plans: Plus élevé selon l'abonnement
- **Taille des emails**: Maximum 40 MB par email
- **Domaine d'envoi**: Doit être vérifié en production

## 📝 TODO / Améliorations futures

- [ ] Ajouter un système de retry pour les emails échoués
- [ ] Créer une table `EmailLog` pour tracking
- [ ] Implémenter des webhooks Resend pour le suivi
- [ ] Ajouter des templates pour mot de passe oublié
- [ ] Créer un dashboard admin pour gérer les emails
- [ ] Ajouter des tests unitaires pour les services
- [ ] Implémenter l'internationalisation (i18n)
- [ ] Ajouter des préférences de notification utilisateur

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Documentation React Email](https://react.email/docs/introduction)
- [Exemples de templates](https://react.email/examples)
- [Best practices pour emails HTML](https://www.campaignmonitor.com/dev-resources/guides/coding-html-emails/)

## 💡 Support

Pour toute question ou problème:
1. Vérifiez que toutes les variables d'environnement sont configurées
2. Consultez les logs de la console pour les erreurs détaillées
3. Vérifiez le dashboard Resend pour le statut des envois
4. Consultez la documentation officielle de Resend

---

Développé avec ❤️ pour Big Vape
