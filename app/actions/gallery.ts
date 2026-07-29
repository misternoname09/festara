'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function getGuestPhotos(eventId: string) {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.storage
      .from('festara-images')
      .list(`guest_uploads/${eventId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error("Erreur récupération galerie:", error);
      return [];
    }

    if (!data) return [];

    // On ignore le dossier vide ("emptyFolderPlaceholder" ou similaire)
    const validFiles = data.filter((f) => f.name !== '.emptyFolderPlaceholder' && f.id);

    // On reconstruit l'URL publique pour chaque fichier
    return validFiles.map((file) => {
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('festara-images')
        .getPublicUrl(`guest_uploads/${eventId}/${file.name}`);
      return publicUrlData.publicUrl;
    });
  } catch (err) {
    console.error("Erreur serveur galerie:", err);
    return [];
  }
}
