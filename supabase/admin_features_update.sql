-- =====================================================================
-- FESTARA / YËGËL — Admin Features Update (Migration)
-- A exécuter dans l'éditeur SQL de Supabase
-- =====================================================================

-- 1. TABLE : global_settings
create table if not exists public.global_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

-- Insert default settings if they don't exist
insert into public.global_settings (key, value, description)
values 
  ('commission_rate', '5'::jsonb, 'Taux de commission prélevé par Festara en %'),
  ('maintenance_mode', 'false'::jsonb, 'Activer/Désactiver la création publique devenements')
on conflict (key) do nothing;

-- 2. TABLE : payouts (Demandes de reversement)
do $$ begin
  create type payout_status as enum ('pending', 'processed', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  bank_details text not null, -- ex: "Wave: 771234567"
  status payout_status not null default 'pending',
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3. TABLE : support_tickets (Helpdesk)
do $$ begin
  create type ticket_status as enum ('open', 'resolved', 'closed');
exception when duplicate_object then null; end $$;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  status ticket_status not null default 'open',
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. ALTER TABLES (Ajout de colonnes aux tables existantes)
alter table public.events 
  add column if not exists admin_status text not null default 'active'; -- 'active' ou 'suspended'

alter table public.payments 
  add column if not exists refund_status text not null default 'none', -- 'none', 'requested', 'refunded'
  add column if not exists platform_fee integer not null default 0;

-- 5. RLS Policies
-- Only allow admin access to global_settings (read/write)
alter table public.global_settings enable row level security;
drop policy if exists settings_read on public.global_settings;
create policy settings_read on public.global_settings for select using (true);

-- Payouts RLS
alter table public.payouts enable row level security;
drop policy if exists payouts_owner_read on public.payouts;
create policy payouts_owner_read on public.payouts for select using (auth.uid() = user_id);

-- Support Tickets RLS
alter table public.support_tickets enable row level security;
drop policy if exists tickets_owner_read on public.support_tickets;
create policy tickets_owner_read on public.support_tickets for select using (auth.uid() = user_id);
