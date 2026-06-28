-- =====================================================================
-- FESTARA / YËGËL — Extension Phase Ndawtal (Cagnotte)
-- A coller dans : Supabase > SQL Editor > New query > Run
-- =====================================================================

alter table public.contributions 
  add column if not exists author_name text not null default 'Anonyme';
