-- =====================================================================
-- FESTARA — Phase 4 : Système d'invitations B2B
-- A exécuter dans l'éditeur SQL de Supabase
-- =====================================================================

create table if not exists public.agency_invitations (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  email            text not null,
  role             text not null default 'member',
  token            uuid not null default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  accepted_at      timestamptz,
  unique(organization_id, email)
);

-- Index pour accélérer la recherche par token
create index if not exists idx_invitations_token on public.agency_invitations(token);

-- RLS
alter table public.agency_invitations enable row level security;

-- L'owner de l'agence ou ses membres existants peuvent voir les invitations
create policy invitations_select on public.agency_invitations for select using (
  organization_id in (select public.get_my_orgs())
);

-- L'owner (ou admins via le code backend si on veut limiter) peut insérer/supprimer.
-- Pour simplifier, on permet à n'importe quel membre de l'org de créer/supprimer des invitations.
-- Dans la vraie vie, on limiterait au rôle 'owner' ou 'admin'.
create policy invitations_insert on public.agency_invitations for insert with check (
  organization_id in (select public.get_my_orgs())
);

create policy invitations_delete on public.agency_invitations for delete using (
  organization_id in (select public.get_my_orgs())
);

-- ATTENTION : Le collaborateur externe qui clique sur le lien n'est pas encore membre de l'org,
-- il ne pourra pas "SELECT" l'invitation via l'API publique si on le restreint.
-- Pour résoudre ce problème en mode Server Component, nous utiliserons le Service Role (createAdminClient)
-- pour lire le token et valider l'invitation. Ainsi, pas besoin de politique publique (anonyme).
