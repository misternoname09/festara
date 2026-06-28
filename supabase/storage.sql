-- =====================================================================
-- FESTARA / YËGËL — Création du Bucket de Stockage (Images)
-- A coller dans : Supabase > SQL Editor > New query > Run
-- =====================================================================

-- 1. Creer un nouveau bucket public appele "festara-images"
insert into storage.buckets (id, name, public)
values ('festara-images', 'festara-images', true)
on conflict (id) do nothing;

-- 2. Autoriser n'importe qui a lire les images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'festara-images' );

-- 3. Autoriser les utilisateurs authentifiés a uploader des images
create policy "Auth Upload"
on storage.objects for insert
with check ( bucket_id = 'festara-images' and auth.role() = 'authenticated' );

-- 4. Autoriser les utilisateurs authentifiés a supprimer ou mettre a jour
create policy "Auth Update/Delete"
on storage.objects for update
using ( bucket_id = 'festara-images' and auth.role() = 'authenticated' );
create policy "Auth Delete"
on storage.objects for delete
using ( bucket_id = 'festara-images' and auth.role() = 'authenticated' );
