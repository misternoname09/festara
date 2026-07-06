-- =====================================================================
-- FESTARA — Mise à jour : Offre B2B Agence
-- A exécuter dans l'éditeur SQL de Supabase
-- =====================================================================

-- 1. Autoriser event_id à être null (si le paiement concerne une agence globale)
alter table public.payments alter column event_id drop not null;

-- 2. Ajouter la colonne organization_id pour les achats de plans d'agence
alter table public.payments add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

-- 3. Mettre à jour l'index
create index if not exists idx_payments_org on public.payments(organization_id);

-- Note : Le plan de l'agence (free, agency, pro) est déjà géré par la colonne `plan` dans `organizations`.
