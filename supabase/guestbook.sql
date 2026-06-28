-- =====================================================================
-- FESTARA / YËGËL — Extension Phase 2 : Livre d'Or
-- A coller dans : Supabase > SQL Editor > New query > Run
-- =====================================================================

create table if not exists public.guestbook_messages (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  author_name text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_guestbook_event on public.guestbook_messages(event_id);
create index if not exists idx_guestbook_created on public.guestbook_messages(created_at desc);

alter table public.guestbook_messages enable row level security;

-- Les invites peuvent lire les messages publies
drop policy if exists guestbook_public_read on public.guestbook_messages;
create policy guestbook_public_read on public.guestbook_messages
  for select using (
    exists (select 1 from public.events e where e.id = guestbook_messages.event_id and e.is_published = true)
  );

-- Le proprietaire peut lire/supprimer les messages de son evenement
drop policy if exists guestbook_owner_all on public.guestbook_messages;
create policy guestbook_owner_all on public.guestbook_messages
  for all using (
    exists (select 1 from public.events e where e.id = guestbook_messages.event_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.events e where e.id = guestbook_messages.event_id and e.user_id = auth.uid())
  );
