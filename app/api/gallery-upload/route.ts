import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;

    if (!file || !eventId) {
      return NextResponse.json({ error: 'Fichier et eventId requis.' }, { status: 400 });
    }

    // Limite de taille à 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop lourd (5MB max).' }, { status: 400 });
    }

    // Seules les images sont autorisées
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image.' }, { status: 400 });
    }

    // On utilise le Admin Client pour bypasser les règles RLS (les invités ne sont pas authentifiés)
    const supabaseAdmin = createAdminClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `guest_uploads/${eventId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('festara-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Récupérer l'URL publique
    const { data } = supabaseAdmin.storage.from('festara-images').getPublicUrl(fileName);

    return NextResponse.json({ url: data.publicUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur générale upload:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
