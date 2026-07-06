-- =====================================================================
-- FESTARA — Application des Policies RLS pour le B2B (Phase 4)
-- A exécuter APRÈS organizations.sql
-- =====================================================================

-- 1. Table events
drop policy if exists events_owner_all on public.events;
create policy events_all on public.events
  for all using (public.has_event_access(id, auth.uid()))
  with check (public.has_event_access(id, auth.uid()));

-- 2. Table guests
drop policy if exists guests_owner_all on public.guests;
create policy guests_all on public.guests
  for all using (public.has_event_access(event_id, auth.uid()))
  with check (public.has_event_access(event_id, auth.uid()));

-- 3. Table contributions
drop policy if exists contrib_owner_read on public.contributions;
create policy contrib_read on public.contributions
  for select using (public.has_event_access(event_id, auth.uid()));

-- 4. Table payments
drop policy if exists payments_owner_read on public.payments;
create policy payments_read on public.payments
  for select using (public.has_event_access(event_id, auth.uid()));

-- 5. Table budget_items (créée en Phase 1)
drop policy if exists budget_items_owner_all on public.budget_items;
create policy budget_items_all on public.budget_items
  for all using (public.has_event_access(event_id, auth.uid()))
  with check (public.has_event_access(event_id, auth.uid()));

-- 6. Table payouts (créée/mise à jour en Phase 2)
-- Note: nous laissons auth.uid() = user_id pour l'insertion (tracer qui demande),
-- mais on s'assure qu'ils ont accès à l'événement
drop policy if exists payouts_owner_insert on public.payouts;
create policy payouts_insert on public.payouts
  for insert with check (
    auth.uid() = user_id and public.has_event_access(event_id, auth.uid())
  );
  
drop policy if exists payouts_owner_select on public.payouts;
create policy payouts_select on public.payouts
  for select using (public.has_event_access(event_id, auth.uid()));

-- 7. Table guestbook_messages
drop policy if exists guestbook_messages_owner_all on public.guestbook_messages;
create policy guestbook_messages_all on public.guestbook_messages
  for all using (public.has_event_access(event_id, auth.uid()))
  with check (public.has_event_access(event_id, auth.uid()));
