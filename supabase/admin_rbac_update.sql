-- =====================================================================
-- FESTARA / YËGËL — Admin RBAC Update
-- A exécuter dans l'éditeur SQL de Supabase
-- =====================================================================

-- 1. Création du type Enum pour les rôles
do $$ begin
  create type admin_role as enum ('superadmin', 'finance', 'moderator', 'support');
exception when duplicate_object then null; end $$;

-- 2. Création de la table admin_users
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  role admin_role not null default 'support',
  created_at timestamptz not null default now()
);

-- 3. Sécurité (RLS)
-- L'accès direct via API publique est interdit (seules les Server Actions avec service_role y accéderont)
alter table public.admin_users enable row level security;

drop policy if exists "No public access" on public.admin_users;
create policy "No public access" on public.admin_users for all using (false);
