import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { guestbookSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
    }

    // Validation Zod
    const validationResult = guestbookSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }

    const { event_id, author_name, message } = validationResult.data;

    // V3 : Rate-limiting par IP pour éviter le spam massif
    const ip = getClientIp(req);
    const { ok } = rateLimit(`guestbook:${ip}`, 10, 10 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: 'Trop de messages. Réessayez plus tard.' }, { status: 429 });
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
      .eq('author_name', author_name)
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
        author_name,
        message,
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

