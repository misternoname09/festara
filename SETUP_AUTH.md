# Festara — Configuration Auth réelle (Twilio SMS + Gmail SMTP)

Aucun code à modifier : tout se configure dans Twilio, Google et Supabase.

---

## PARTIE A — SMS réel avec Twilio

### 1. Créer le compte Twilio
1. Va sur https://www.twilio.com → Sign up.
2. Vérifie ton propre numéro (+221...).
3. **Important** : en mode *trial*, Twilio n'envoie qu'aux numéros que tu as
   vérifiés. Pour envoyer à n'importe quel invité/marié, **ajoute du crédit**
   (Upgrade). Compter ~0,05–0,08 $ par SMS vers le Sénégal.

### 2. Obtenir un expéditeur
Deux options (choisis-en une) :
- **Sender ID alphanumérique** (recommandé pour le Sénégal) : nom court d'expéditeur,
  ex. `FESTARA`. Console → Messaging → Sender IDs. Le Sénégal supporte
  l'alphanumérique (pas de réception de réponse, mais parfait pour l'OTP).
- **Numéro Twilio** : achète un numéro compatible SMS (peut ne pas porter vers
  certains réseaux SN — l'alphanumérique est plus sûr).

Le plus robuste : créer un **Messaging Service** (Console → Messaging → Services),
y attacher ton Sender ID / numéro, et récupérer son **Messaging Service SID**
(commence par `MG...`).

### 3. Récupérer les identifiants (Console Twilio, page d'accueil)
- **Account SID** (`AC...`)
- **Auth Token**
- **Messaging Service SID** (`MG...`) ou le numéro expéditeur

### 4. Brancher dans Supabase
Authentication → **Providers** → **Phone** → Enable, puis :
- SMS provider : **Twilio**
- **Twilio Account SID** : `AC...`
- **Twilio Auth Token** : ton token
- **Twilio Message Service SID** : `MG...` (ou ton numéro Twilio)
- Enregistre.

> Astuce : il existe aussi « Twilio Verify » dans la liste — c'est le service OTP
> clé-en-main de Twilio. Le « Twilio » standard ci-dessus suffit et est plus simple.

### 5. Tester
`/login` → onglet **Téléphone** → `+221...` → tu reçois le code par SMS → connecté.

---

## PARTIE B — Emails via Gmail (SMTP)

Supabase enverra les liens/codes de connexion et confirmations via ton Gmail.

### 1. Créer un mot de passe d'application Google
Gmail bloque le SMTP avec ton mot de passe normal. Il faut un **App Password** :
1. Compte Google → **Sécurité** → active la **validation en 2 étapes** (obligatoire).
2. Puis → **Mots de passe des applications** → crée-en un (nom : « Festara Supabase »).
3. Google affiche un mot de passe de **16 caractères** — copie-le (sans espaces).

### 2. Configurer le SMTP dans Supabase
Authentication → **Emails** (ou Project Settings → Auth → SMTP) → **Enable Custom SMTP** :
- **Sender email** : ton-adresse@gmail.com
- **Sender name** : Festara
- **Host** : `smtp.gmail.com`
- **Port** : `465` (SSL) — ou `587` (TLS) si 465 échoue
- **Username** : ton-adresse@gmail.com (l'adresse complète)
- **Password** : le mot de passe d'application 16 caractères
- Enregistre.

### 3. Personnaliser les messages (optionnel mais conseillé)
Authentication → **Email Templates** → édite « Magic Link » / « Confirm signup »
en français aux couleurs Festara. Variables utiles : `{{ .ConfirmationURL }}`
(lien) et `{{ .Token }}` (code à 6 chiffres si tu préfères un code à saisir).

### 4. Limites Gmail
- Gmail gratuit : ~**500 emails/jour** ; Google Workspace : ~2 000/jour.
- Suffisant pour démarrer. Pour le scale, passe à un service transactionnel
  (Resend, SendGrid, Postmark) — même écran SMTP, autres identifiants.

---

## Rappels production
- En prod (Vercel) : pense à autoriser ton domaine dans Authentication → URL
  Configuration (Site URL + Redirect URLs `.../auth/callback`).
- Régénère les clés sensibles partagées avant l'ouverture au public.
- Les coûts SMS sont réels : protège l'envoi OTP par le **rate limiting** Supabase
  (Authentication → Rate Limits) pour éviter l'abus.
