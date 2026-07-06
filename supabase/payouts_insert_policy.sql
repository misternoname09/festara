-- =====================================================================
-- FESTARA — Ajout policy insertion payouts (demande de reversement)
-- A exécuter dans l'éditeur SQL de Supabase
-- =====================================================================

-- S'assurer que la colonne event_id existe bien (pour calculer le solde par événement)
alter table public.payouts add column if not exists event_id uuid references public.events(id);

drop policy if exists payouts_owner_insert on public.payouts;
create policy payouts_owner_insert on public.payouts
  for insert with check (auth.uid() = user_id);
