-- =====================================================================
-- FESTARA — Phase 5: Event Collaborators
-- A exécuter dans l'éditeur SQL de Supabase
-- =====================================================================

-- 1. Table des collaborateurs d'un événement (déjà acceptés)
create table if not exists public.event_collaborators (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'co_host', -- 'co_host' ou 'scanner'
  created_at  timestamptz not null default now(),
  unique(event_id, user_id)
);

create index if not exists idx_event_collab_event on public.event_collaborators(event_id);
create index if not exists idx_event_collab_user on public.event_collaborators(user_id);

alter table public.event_collaborators enable row level security;

-- 2. Table des invitations en attente pour un événement
create table if not exists public.event_invitations (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  role        text not null default 'co_host',
  token       uuid not null default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz
);

create index if not exists idx_evt_invitations_token on public.event_invitations(token);

alter table public.event_invitations enable row level security;

-- =====================================================================
-- RLS pour event_collaborators et event_invitations
-- =====================================================================

-- Utilisateur peut voir les collaborateurs des événements auxquels il a accès
create policy collab_select on public.event_collaborators for select using (
  public.has_event_access(event_id, auth.uid())
);

-- Utilisateur peut ajouter/supprimer s'il est owner ou admin B2B de l'event (via has_event_access)
create policy collab_insert on public.event_collaborators for insert with check (
  public.has_event_access(event_id, auth.uid())
);
create policy collab_delete on public.event_collaborators for delete using (
  public.has_event_access(event_id, auth.uid())
);

-- Pareil pour les invitations
create policy evt_invit_select on public.event_invitations for select using (
  public.has_event_access(event_id, auth.uid())
);
create policy evt_invit_insert on public.event_invitations for insert with check (
  public.has_event_access(event_id, auth.uid())
);
create policy evt_invit_delete on public.event_invitations for delete using (
  public.has_event_access(event_id, auth.uid())
);


-- =====================================================================
-- MISE À JOUR : FONCTION POUR VERIFIER L'ACCES A UN EVENEMENT
-- Remplace la version précédente pour inclure event_collaborators
-- =====================================================================
create or replace function public.has_event_access(evt_id uuid, usr_id uuid)
returns boolean
language plpgsql security definer
as $$
declare
  is_owner boolean;
  has_org_access boolean;
  has_collab_access boolean;
begin
  -- 1. Verifie si proprietaire direct
  select exists(
    select 1 from public.events where id = evt_id and user_id = usr_id
  ) into is_owner;

  if is_owner then return true; end if;

  -- 2. Verifie si acces via agence (B2B)
  select exists(
    select 1 from public.events e
    join public.organization_members om on e.organization_id = om.organization_id
    where e.id = evt_id and om.user_id = usr_id
  ) into has_org_access;

  if has_org_access then return true; end if;

  -- 3. Verifie si acces direct en tant que collaborateur d'événement
  select exists(
    select 1 from public.event_collaborators
    where event_id = evt_id and user_id = usr_id
  ) into has_collab_access;

  return has_collab_access;
end;
$$;

-- =====================================================================
-- MISE À JOUR : Rendre l'email optionnel pour les invitations d'agence
-- afin de supporter les "Liens Magiques" génériques.
-- =====================================================================
alter table public.agency_invitations alter column email drop not null;

