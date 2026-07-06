-- =====================================================================
-- FESTARA / YËGËL — Schema Supabase (PostgreSQL)
-- Version 2.0 — Mai 2026
-- A coller dans : Supabase > SQL Editor > New query > Run
-- Idempotent : peut etre rejoue sans casser l'existant.
-- =====================================================================

-- Extensions ----------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- =====================================================================
-- 1. ENUMS
-- =====================================================================
do $$ begin
  create type template_kind as enum ('wax', 'arabic', 'modern');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_provider as enum ('paydunya', 'cinetpay', 'stripe', 'wave');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'confirmed', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_kind as enum ('gratuit', 'essentiel', 'premium', 'pro');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- 1b. FONCTION : code court 6 caracteres (definie AVANT les tables car
--     utilisee comme DEFAULT de guests.pass_code)
-- =====================================================================
create or replace function public.gen_pass_code()
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  i int;
begin
  for i in 1..6 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return code;
end $$;

-- =====================================================================
-- 2. TABLE : events  (un mariage / une celebration)
-- =====================================================================
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  slug              text unique not null,
  title             text not null,
  template          template_kind not null default 'modern',
  couple_photo_url  text,
  -- Array : [{ "id","name","date","time","location","maps_url" }]
  ceremonies        jsonb not null default '[]'::jsonb,
  -- Couleurs choisies par les maries (pass + invitation)
  theme_colors      jsonb not null default '{"primary":"#1A2A4A","accent":"#B68A35"}'::jsonb,
  plan              plan_kind not null default 'gratuit',
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_events_user on public.events(user_id);
create index if not exists idx_events_slug on public.events(slug);

-- =====================================================================
-- 3. TABLE : guests  (invites + RSVP + pass)
-- =====================================================================
create table if not exists public.guests (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references public.events(id) on delete cascade,
  first_name          text not null,
  party_size          integer not null default 1 check (party_size >= 1),
  -- IDs des ceremonies confirmees (references aux ceremonies jsonb de events)
  ceremonies_attending text[] not null default '{}',
  pass_code           text unique not null default public.gen_pass_code(),
  pass_uuid           uuid unique not null default gen_random_uuid(),
  rsvp_confirmed_at   timestamptz,
  -- Controle d'acces jour J
  scanned_at          timestamptz,                 -- null = pas encore scanne
  checked_in_count    integer not null default 0,  -- accompagnants deja entres
  created_at          timestamptz not null default now()
);

create index if not exists idx_guests_event on public.guests(event_id);
create index if not exists idx_guests_pass_uuid on public.guests(pass_uuid);
create index if not exists idx_guests_pass_code on public.guests(pass_code);

-- =====================================================================
-- 4. TABLE : payments  (achat d'un plan par les maries)
-- =====================================================================
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      integer not null,             -- FCFA (ou centimes EUR/USD)
  currency    text not null default 'XOF',  -- XOF | EUR | USD | GBP
  provider    payment_provider not null,
  status      payment_status not null default 'pending',
  -- Reference renvoyee par la passerelle (token PayDunya, session Stripe...)
  provider_ref text,
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_payments_event on public.payments(event_id);
create index if not exists idx_payments_status on public.payments(status);

-- =====================================================================
-- 5. TABLE : contributions  (Cagnotte / Ndawtal — Phase 2)
-- =====================================================================
create table if not exists public.contributions (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  guest_id    uuid references public.guests(id) on delete set null,
  amount      integer not null check (amount > 0),  -- FCFA
  fee         integer not null default 0,           -- commission Festara
  provider    payment_provider not null,
  status      payment_status not null default 'pending',
  provider_ref text,
  message     text,                                 -- mot de l'invite
  created_at  timestamptz not null default now()
);

create index if not exists idx_contrib_event on public.contributions(event_id);
create index if not exists idx_contrib_status on public.contributions(status);

-- =====================================================================
-- 6. FONCTIONS UTILITAIRES
-- =====================================================================

-- updated_at automatique sur events
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_events_touch on public.events;
create trigger trg_events_touch
  before update on public.events
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================================
alter table public.events        enable row level security;
alter table public.guests        enable row level security;
alter table public.payments      enable row level security;
alter table public.contributions enable row level security;

-- ---- events ----------------------------------------------------------
-- Le proprietaire gere ses evenements
drop policy if exists events_owner_all on public.events;
create policy events_owner_all on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Lecture publique des invitations PUBLIEES (page /i/[slug])
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
  for select using (is_published = true);

-- ---- guests ----------------------------------------------------------
-- Le proprietaire de l'evenement voit / gere tous ses invites
drop policy if exists guests_owner_all on public.guests;
create policy guests_owner_all on public.guests
  for all using (
    exists (select 1 from public.events e where e.id = guests.event_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.events e where e.id = guests.event_id and e.user_id = auth.uid())
  );

-- NB : la creation d'un RSVP par un invite anonyme passe par une route
-- serveur (service_role) — voir /app/api/rsvp. Pas de policy anonyme ici
-- pour eviter le spam direct sur la table.

-- ---- payments --------------------------------------------------------
drop policy if exists payments_owner_read on public.payments;
create policy payments_owner_read on public.payments
  for select using (auth.uid() = user_id);
-- Insertion / update via service_role uniquement (webhooks passerelle).

-- ---- contributions ---------------------------------------------------
-- Le proprietaire voit les contributions a son evenement
drop policy if exists contrib_owner_read on public.contributions;
create policy contrib_owner_read on public.contributions
  for select using (
    exists (select 1 from public.events e where e.id = contributions.event_id and e.user_id = auth.uid())
  );
-- Insertion via service_role (apres confirmation passerelle).

-- =====================================================================
-- 8. VUE : statistiques dashboard (confirmes / en attente / total)
-- =====================================================================
drop view if exists public.event_stats;
create view public.event_stats
with (security_invoker = true) as
select
  e.id as event_id,
  count(g.*)                                              as guests_total,
  count(g.*) filter (where g.rsvp_confirmed_at is not null) as guests_confirmed,
  coalesce(sum(g.party_size) filter (where g.rsvp_confirmed_at is not null), 0) as people_confirmed,
  count(g.*) filter (where g.scanned_at is not null)       as guests_scanned
from public.events e
left join public.guests g on g.event_id = e.id
group by e.id;

-- NOTE: Si vous avez déjà exécuté une ancienne version de ce script, 
-- vous DEVEZ le ré-exécuter dans l'éditeur SQL de Supabase manuellement 
-- pour appliquer le security_invoker = true à la vue event_stats.-- =====================================================================
-- FIN — Festara / Yëgël schema v2.0
-- =====================================================================
