# Festara — Déploiement sur Vercel

Le déploiement résout deux limites du local : l'accès **caméra** (exige HTTPS) et les **callbacks de paiement** (PayDunya / Stripe doivent joindre une URL publique).

---

## 1. Pousser le code sur GitHub

Depuis le dossier `FESTARA (1)` :

```bash
git init
git add .
git commit -m "Festara MVP"
git branch -M main
git remote add origin https://github.com/<ton-compte>/festara.git
git push -u origin main
```

> `.env.local` n'est **pas** poussé (il est dans `.gitignore`) — c'est voulu. Les clés se configurent dans Vercel.

---

## 2. Importer dans Vercel

1. vercel.com → **Add New → Project** → importe le dépôt `festara`.
2. Framework détecté : **Next.js** (rien à changer).
3. Avant de déployer, ajoute les variables d'environnement (étape 3).

---

## 3. Variables d'environnement Vercel

Project → Settings → **Environment Variables**. Ajoute (Production + Preview) :

```
NEXT_PUBLIC_SUPABASE_URL=https://ytxgmmmzibwyqjacvcqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ta clé anon>
SUPABASE_SERVICE_ROLE_KEY=<ta clé service_role>
NEXT_PUBLIC_SITE_URL=https://<ton-projet>.vercel.app

# --- PRODUCTION = mode LIVE (vrais paiements) ---
PAYDUNYA_MODE=live
PAYDUNYA_MASTER_KEY=<ta master key>
PAYDUNYA_PUBLIC_KEY=<live_public_... RÉGÉNÉRÉE>
PAYDUNYA_PRIVATE_KEY=<live_private_... RÉGÉNÉRÉE>
PAYDUNYA_TOKEN=<token live RÉGÉNÉRÉ>

STRIPE_SECRET_KEY=<sk_live_... depuis stripe.com>
STRIPE_WEBHOOK_SECRET=<whsec_... voir étape 6>
```

> **Important** :
> - En production on met `PAYDUNYA_MODE=live` → les clients ne voient plus
>   « PAIEMENT TEST », ce sont de vrais paiements.
> - En local (`.env.local`) on **garde** `PAYDUNYA_MODE=test` pour développer
>   sans argent réel.
> - Mets à jour `NEXT_PUBLIC_SITE_URL` avec l'URL réelle après le 1er déploiement,
>   puis redeploy.
> - **Régénère** les clés PayDunya/Stripe avant de les coller ici (elles ont été
>   partagées en clair).

---

## 4. Supabase — autoriser le domaine

Supabase → Authentication → **URL Configuration** :
- **Site URL** : `https://<ton-projet>.vercel.app`
- **Redirect URLs** : ajoute la même URL.

Sans ça, l'OTP / la session échouent en production.

---

## 5. PayDunya — URL de callback

Dans ton app PayDunya :
- **URL du site Web** : `https://<ton-projet>.vercel.app`
- La callback est déjà gérée par le code : `https://<ton-projet>.vercel.app/api/pay/paydunya/callback`
- Quand tu es prêt à encaisser réellement : passe `PAYDUNYA_MODE=live` et bascule les clés live (déjà en commentaire dans `.env.local`). Régénère d'abord les clés exposées.

---

## 6. Stripe — webhook

1. stripe.com → Developers → **Webhooks** → Add endpoint.
2. URL : `https://<ton-projet>.vercel.app/api/pay/stripe/webhook`
3. Événement à écouter : `checkout.session.completed`
4. Copie le **Signing secret** (`whsec_...`) → variable `STRIPE_WEBHOOK_SECRET` dans Vercel → redeploy.

---

## 7. Checklist de recette (après déploiement)

- [ ] La landing s'ouvre sur l'URL Vercel.
- [ ] `/login` envoie un OTP et connecte (Phone provider + SMS configurés dans Supabase).
- [ ] Création d'une invitation → publication → page `/i/[slug]` visible.
- [ ] RSVP réel → un `guest` apparaît dans Supabase avec pass_code.
- [ ] `/pass/[uuid]` affiche le QR.
- [ ] `/scan/[eventId]` ouvre la caméra (HTTPS OK) → scan vert/orange/rouge.
- [ ] Paiement PayDunya sandbox → retour + plan appliqué (callback joignable).
- [ ] Paiement Stripe test → webhook → plan appliqué.
- [ ] Export CSV télécharge la liste des invités.

---

## 8. Passage en production (live)

1. Régénère **toutes** les clés partagées (Supabase service_role, PayDunya, Stripe).
2. PayDunya : `PAYDUNYA_MODE=live` + clés live.
3. Stripe : clés `sk_live_...` + nouveau webhook live.
4. Domaine personnalisé : `festara.app` → Vercel → Settings → Domains.
5. RGPD : ajoute une page **politique de confidentialité** avant d'ouvrir à la diaspora.
