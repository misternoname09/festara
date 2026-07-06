-- =====================================================================
-- FESTARA / YËGËL — Création du Bucket de Stockage (Images)
-- A coller dans : Supabase > SQL Editor > New query > Run
--
-- NOTE DE SÉCURITÉ IMPORTANTE :
-- Ce script a été mis à jour pour corriger une faille de sécurité.
-- Vous DEVEZ le ré-exécuter dans l'éditeur SQL de Supabase manuellement 
-- (un git push ne suffit pas) pour appliquer les nouvelles règles RLS.
--
-- Les fichiers déjà existants dans le bucket avant cette migration 
-- ne seront pas automatiquement déplacés dans un sous-dossier {user_id}/.
-- Il faudra soit les migrer manuellement, soit accepter qu'ils restent 
-- inaccessibles en écriture/suppression (mais toujours lisibles).
-- =====================================================================

-- 1. Creer un nouveau bucket public appele "festara-images"
insert into storage.buckets (id, name, public)
values ('festara-images', 'festara-images', true)
on conflict (id) do nothing;

-- Configuration des limites de taille et types MIME
update storage.buckets
set file_size_limit = 5242880, -- 5 Mo
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'festara-images';

-- 2. Autoriser n'importe qui a lire les images
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'festara-images' );

-- 3. Autoriser les utilisateurs authentifiés a uploader des images (Dossier personnel)
drop policy if exists "Auth Upload" on storage.objects;
drop policy if exists "Owner Upload" on storage.objects;
create policy "Owner Upload" on storage.objects for insert
  with check (
    bucket_id = 'festara-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Autoriser les utilisateurs authentifiés a mettre a jour leurs images
drop policy if exists "Auth Update/Delete" on storage.objects;
drop policy if exists "Owner Update" on storage.objects;
create policy "Owner Update" on storage.objects for update
  using (
    bucket_id = 'festara-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Autoriser les utilisateurs authentifiés a supprimer leurs images
drop policy if exists "Auth Delete" on storage.objects;
drop policy if exists "Owner Delete" on storage.objects;
create policy "Owner Delete" on storage.objects for delete
  using (
    bucket_id = 'festara-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
