-- =====================================================================
-- FESTARA / YËGËL — Extension Phase 3 : WhatsApp Automation
-- A coller dans : Supabase > SQL Editor > New query > Run
-- =====================================================================

alter table public.guests 
  add column if not exists phone text,
  add column if not exists whatsapp_sent boolean not null default false;
