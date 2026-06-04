# Festara — Setup Supabase (étape 1)

## 1. Créer le projet
1. supabase.com → New project (région : Europe West, la plus proche du Sénégal/diaspora).
2. Note bien : **Project URL**, **anon public key**, **service_role key** (Settings → API).

## 2. Charger le schéma
SQL Editor → New query → colle tout `schema.sql` → **Run**.
Le script est idempotent (rejouable sans casse).

## 3. Activer l'auth par téléphone (OTP SMS)
Authentication → Providers → **Phone** → Enable.
Brancher un fournisseur SMS (Twilio ou MessageBird) avec une clé valide.

## 4. Storage (photos couple)
Storage → New bucket → nom `couples` → **Public** (lecture publique des photos d'invitation).

## 5. Variables d'environnement (à reporter dans le front)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # serveur uniquement, jamais exposé au client
PAYDUNYA_MASTER_KEY=...
PAYDUNYA_PRIVATE_KEY=...
PAYDUNYA_TOKEN=...
STRIPE_SECRET_KEY=...
```

## Contenu du schéma
- `events` — un mariage (slug public, template, cérémonies jsonb, couleurs, plan).
- `guests` — invités + RSVP + pass (pass_code 6 car., pass_uuid, scanned_at).
- `payments` — achat d'un plan par les mariés.
- `contributions` — cagnotte / Ndawtal (Phase 2).
- `event_stats` — vue agrégée pour le dashboard (confirmés / en attente / scannés).

**Sécurité** : RLS activé partout. Les mariés ne voient que leurs données. Les écritures publiques (RSVP anonyme, webhooks paiement) passent par des routes serveur en `service_role`, jamais en accès direct client.
