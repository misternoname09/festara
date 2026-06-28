# Festara — Configuration Auth (Email/Mot de passe, OTP Email, Google OAuth)

Ce document explique comment configurer Supabase pour utiliser le nouveau flux d'authentification.

---

## PARTIE A — Authentification Classique (Email + Mot de passe + OTP)

### 1. Activer le fournisseur Email
1. Connecte-toi à ton tableau de bord Supabase.
2. Va dans **Authentication** → **Providers** → **Email**.
3. Assure-toi que "Enable Email provider" est activé.
4. Assure-toi que "Confirm email" est **activé**.

### 2. Configurer les modèles d'Email (OTP)
Par défaut, Supabase envoie un lien magique de confirmation. Nous voulons envoyer un code à 6 chiffres (OTP).
1. Va dans **Authentication** → **Email Templates**.
2. Dans l'onglet **Confirm signup**, remplace le modèle par défaut par quelque chose comme ceci :

```html
<h2>Bienvenue sur Festara !</h2>
<p>Utilisez ce code à 6 chiffres pour valider votre compte :</p>
<h1 style="letter-spacing: 5px;">{{ .Token }}</h1>
```
L'élément clé est `{{ .Token }}` au lieu de `{{ .ConfirmationURL }}`. Supabase générera et insérera un OTP à 6 chiffres.

### 3. SMTP personnalisé (Optionnel mais recommandé)
Si les emails n'arrivent pas, configure ton propre SMTP (ex: Gmail) :
1. Va dans **Authentication** → **SMTP**.
2. Active **Enable Custom SMTP**.
3. **Host** : `smtp.gmail.com`
4. **Port** : `465` (SSL)
5. **Username** : ton-adresse@gmail.com
6. **Password** : Mot de passe d'application Google (16 caractères générés dans ton compte Google, sécurité).
7. **Sender email** : ton-adresse@gmail.com

---

## PARTIE B — Authentification Google (OAuth)

Pour que le bouton "Continuer avec Google" fonctionne, tu dois lier ton projet Supabase à Google Cloud.

### 1. Créer un projet sur Google Cloud
1. Va sur [Google Cloud Console](https://console.cloud.google.com/).
2. Crée un nouveau projet.
3. Va dans **APIs & Services** → **OAuth consent screen** et configure-le (External).
4. Va dans **Credentials** → **Create Credentials** → **OAuth client ID**.
5. Type d'application : **Web application**.

### 2. Configurer les URL de redirection (Google)
Dans Google Cloud Console, sous **Authorized redirect URIs**, ajoute l'URL de callback de ton projet Supabase :
`https://<project-ref>.supabase.co/auth/v1/callback`
(Tu trouveras cette URL exacte dans Supabase → Authentication → Providers → Google).

### 3. Brancher dans Supabase
1. Copie le **Client ID** et le **Client Secret** depuis Google.
2. Dans Supabase, va dans **Authentication** → **Providers** → **Google**.
3. Active-le et colle le **Client ID** et le **Client Secret**.
4. Enregistre.

---

## Rappels Production
- N'oublie pas d'ajouter l'URL de ton site en production (ex: `https://festara.app`) dans **Authentication** → **URL Configuration** → **Site URL**.
- Ajoute également l'URL de callback de production (ex: `https://festara.app/auth/callback`) dans **Redirect URLs**.
