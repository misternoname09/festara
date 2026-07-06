-- =====================================================================
-- FESTARA — Phase 4: B2B Organizations / Agencies
-- A exécuter dans l'éditeur SQL de Supabase
-- =====================================================================

create table if not exists public.organizations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id),
  name          text not null,
  plan          text not null default 'free', -- free, pro, agency
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.organization_members (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  role             text not null default 'member', -- owner, admin, member
  created_at       timestamptz not null default now(),
  unique(organization_id, user_id)
);

-- Ajouter l'organization_id aux events
alter table public.events add column if not exists organization_id uuid references public.organizations(id) on delete set null;

-- Indexes pour les performances
create index if not exists idx_org_members_org on public.organization_members(organization_id);
create index if not exists idx_org_members_user on public.organization_members(user_id);
create index if not exists idx_events_org on public.events(organization_id);

-- RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- =====================================================================
-- RLS Fix: On evite les requetes croisées qui créent une récursion infinie.
-- =====================================================================

-- 1. Fonction pour recuperer les organisations d'un utilisateur (Bypass RLS)
create or replace function public.get_my_orgs()
returns setof uuid
language sql security definer
as $$
  select organization_id from public.organization_members where user_id = auth.uid();
$$;

-- Organizations: l'owner peut tout faire. Un membre peut voir l'org.
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations for select using (
  owner_id = auth.uid() or id in (select public.get_my_orgs())
);

drop policy if exists org_all on public.organizations;
create policy org_all on public.organizations for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Organization Members: 
drop policy if exists org_members_select on public.organization_members;
create policy org_members_select on public.organization_members for select using (
  user_id = auth.uid() or organization_id in (select id from public.organizations where owner_id = auth.uid())
);

drop policy if exists org_members_all on public.organization_members;
create policy org_members_all on public.organization_members for all using (
  organization_id in (select id from public.organizations where owner_id = auth.uid())
);

-- =====================================================================
-- FONCTION UTILITAIRE POUR VERIFIER L'ACCES A UN EVENEMENT
-- Cette fonction remplace la simple vérification (auth.uid() = user_id)
-- =====================================================================
create or replace function public.has_event_access(evt_id uuid, usr_id uuid)
returns boolean
language plpgsql security definer
as $$
declare
  is_owner boolean;
  has_org_access boolean;
begin
  -- Verifie si proprietaire direct
  select exists(
    select 1 from public.events where id = evt_id and user_id = usr_id
  ) into is_owner;

  if is_owner then return true; end if;

  -- Verifie si acces via agence
  select exists(
    select 1 from public.events e
    join public.organization_members om on e.organization_id = om.organization_id
    where e.id = evt_id and om.user_id = usr_id
  ) into has_org_access;

  return has_org_access;
end;
$$;

-- Note: Les policies sur events, guests, etc. devront être mises à jour manuellement
-- pour utiliser public.has_event_access(event_id, auth.uid()) au lieu de user_id = auth.uid().
