# Migration vers NextAuth.js v5

## Résumé des changements

✅ **Kinde remplacé par NextAuth.js v5** avec authentification email/password

### Modifications effectuées :

1. **Installation des dépendances**
   - `next-auth@beta` (NextAuth v5)
   - `@auth/prisma-adapter` (Adapter Prisma)
   - `bcrypt` (Hachage des mots de passe)

2. **Schéma de base de données** (`prisma/schema.prisma`)
   - Modèle `User` mis à jour (ID string, champs optionnels)
   - Nouveaux modèles : `Account`, `Session`, `VerificationToken`
   - Relations mises à jour pour `Order` et `Cart`

3. **Configuration NextAuth**
   - `auth.config.ts` - Configuration avec provider Credentials
   - `auth.ts` - Exportation des handlers NextAuth
   - `/app/api/auth/[...nextauth]/route.ts` - Route API

4. **Fichiers modifiés**
   - ✅ `/app/services/getServerSession.ts` - Utilise NextAuth
   - ✅ `/app/api/orders/route.ts` - Authentification NextAuth
   - ✅ `/app/(dashboard)/dashboard/layout.tsx` - Server component avec NextAuth
   - ✅ `/app/components/storeFront/Navigation.tsx` - `useSession()` hook
   - ✅ `/app/(client)/account/page.tsx` - NextAuth client
   - ✅ `/app/(client)/orders/page.tsx` - NextAuth client
   - ✅ `/app/(client)/checkout/page.tsx` - NextAuth client

5. **Nouvelles pages**
   - `/app/(auth)/login/page.tsx` - Page de connexion
   - `/app/(auth)/register/page.tsx` - Page d'inscription
   - `/app/api/auth/register/route.ts` - API d'inscription

6. **Middleware**
   - `middleware.ts` - Protection des routes avec NextAuth

7. **SessionProvider**
   - `/app/components/SessionProvider.tsx` - Wrapper NextAuth
   - Ajouté aux layouts client et auth

## 🚀 Étapes pour finaliser l'installation

### 1. Variables d'environnement

Créez/modifiez votre fichier `.env` :

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/big_vape"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere-avec-openssl-rand-base64-32"

# Supprimez les anciennes variables Kinde :
# KINDE_CLIENT_ID
# KINDE_CLIENT_SECRET
# KINDE_ISSUER_URL
# etc.
```

### 2. Générer un secret NextAuth

```bash
openssl rand -base64 32
```

Copiez le résultat dans `NEXTAUTH_SECRET`.

### 3. Appliquer la migration de base de données

⚠️ **IMPORTANT** : Cette migration modifie le type d'ID des utilisateurs (Int → String).
Les données existantes seront affectées. Faites une sauvegarde avant !

```bash
# Générer le client Prisma
npx prisma generate

# Créer et appliquer la migration
npx prisma migrate dev --name add_nextauth_models

# Ou réinitialiser la base de données (⚠️ supprime toutes les données)
npx prisma migrate reset
```

### 4. Installer les dépendances

```bash
npm install
```

### 5. Lancer l'application

```bash
npm run dev
```

## 🧪 Tester l'authentification

1. **Inscription**
   - Allez sur http://localhost:3000/register
   - Créez un compte avec email/password
   - Vous serez automatiquement connecté

2. **Connexion**
   - Allez sur http://localhost:3000/login
   - Connectez-vous avec vos identifiants

3. **Routes protégées**
   - `/account` - Page compte utilisateur
   - `/orders` - Historique des commandes
   - `/checkout` - Finalisation de commande
   - `/dashboard` - Dashboard admin (alexandre26goumain@gmail.com uniquement)

4. **Déconnexion**
   - Cliquez sur l'icône utilisateur → "Se déconnecter"

## 📋 Fonctionnalités

✅ **Authentification email/password**
- Inscription avec validation
- Connexion sécurisée
- Hachage des mots de passe avec bcrypt
- Sessions JWT

✅ **Protection des routes**
- Middleware NextAuth
- Redirection automatique vers /login
- Redirection automatique vers / si déjà connecté

✅ **Prêt pour OAuth**
- Structure Account pour futurs providers (Google, GitHub, etc.)
- Facile à ajouter plus tard

✅ **Gestion des sessions**
- Sessions côté serveur et client
- Hook `useSession()` pour composants React
- Helper `auth()` pour Server Components

## 🔐 Sécurité

- Mots de passe hachés avec bcrypt (10 rounds)
- Sessions JWT sécurisées
- Protection CSRF intégrée
- Validation Zod des inputs
- Types TypeScript stricts

## 🎯 Prochaines étapes possibles

1. **Ajouter OAuth providers**
   ```typescript
   // Dans auth.config.ts
   import Google from "next-auth/providers/google"
   import GitHub from "next-auth/providers/github"

   providers: [
     Credentials({ ... }),
     Google({
       clientId: process.env.GOOGLE_CLIENT_ID,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
     }),
     GitHub({
       clientId: process.env.GITHUB_CLIENT_ID,
       clientSecret: process.env.GITHUB_CLIENT_SECRET,
     }),
   ]
   ```

2. **Vérification email**
   - Utiliser le modèle `VerificationToken`
   - Envoyer un email de confirmation

3. **Récupération de mot de passe**
   - Page "Mot de passe oublié"
   - Envoi de token par email

4. **Profil utilisateur**
   - Page d'édition du profil
   - Upload d'avatar
   - Modification du mot de passe

## ❓ Problèmes fréquents

### Erreur "Database connection failed"
→ Vérifiez votre `DATABASE_URL` dans `.env`

### Erreur "Invalid session"
→ Vérifiez que `NEXTAUTH_SECRET` est défini

### Les utilisateurs existants ne peuvent pas se connecter
→ Normal, ils ont été créés avec Kinde. Ils doivent se réinscrire avec un nouveau mot de passe.

### "Prisma generate failed"
→ Exécutez `npx prisma generate` après modification du schéma

## 📚 Documentation

- [NextAuth.js v5 Docs](https://authjs.dev/)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [NextAuth.js Guides](https://authjs.dev/getting-started)
