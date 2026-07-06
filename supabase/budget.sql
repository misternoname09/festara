-- =====================================================================
-- FESTARA — Budget mariage (Phase Budget)
-- A coller dans : Supabase > SQL Editor > New query > Run
-- =====================================================================

create table if not exists public.budget_items (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  category      text not null,       -- ex: "Traiteur", "Tenue traditionnelle", "Dot", "DJ", "Location salle"
  planned_amount integer not null default 0 check (planned_amount >= 0),
  actual_amount  integer not null default 0 check (actual_amount >= 0),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_budget_items_event on public.budget_items(event_id);

-- updated_at automatique
drop trigger if exists trg_budget_items_touch on public.budget_items;
create trigger trg_budget_items_touch
  before update on public.budget_items
  for each row execute function public.touch_updated_at();

-- RLS : uniquement le propriétaire de l'événement
alter table public.budget_items enable row level security;

drop policy if exists budget_items_owner_all on public.budget_items;
create policy budget_items_owner_all on public.budget_items
  for all using (
    exists (select 1 from public.events e where e.id = budget_items.event_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.events e where e.id = budget_items.event_id and e.user_id = auth.uid())
  );
