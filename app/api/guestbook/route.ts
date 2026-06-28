import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { event_id, author_name, message } = await req.json();

    if (!event_id || !author_name || !message) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (author_name.length > 50) {
      return NextResponse.json({ error: 'Le nom est trop long.' }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Le message est trop long (max 500 caractères).' }, { status: 400 });
    }

    // L'invité n'est pas connecté (anonyme), donc RLS bloque les inserts normaux.
    // On utilise le client Admin (service_role) pour forcer l'insertion.
    const admin = createAdminClient();

    // Verifier que l'evenement existe et est publie
    const { data: ev, error: evError } = await admin
      .from('events')
      .select('id')
      .eq('id', event_id)
      .eq('is_published', true)
      .single();

    if (evError || !ev) {
      return NextResponse.json({ error: 'Événement invalide ou non publié.' }, { status: 404 });
    }

    // Anti-Spam basique (Rate Limiting via DB) : Pas plus d'un message par minute pour le meme auteur
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentMsg } = await admin
      .from('guestbook_messages')
      .select('id')
      .eq('event_id', event_id)
      .eq('author_name', author_name.trim())
      .gte('created_at', oneMinuteAgo)
      .maybeSingle();

    if (recentMsg) {
      return NextResponse.json({ error: 'Veuillez patienter 1 minute avant de poster un nouveau message.' }, { status: 429 });
    }

    // Insertion
    const { error: insertError } = await admin
      .from('guestbook_messages')
      .insert({
        event_id,
        author_name: author_name.trim(),
        message: message.trim(),
      });

    if (insertError) {
      console.error('Erreur insertion Guestbook:', insertError);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde du message.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Guestbook:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
