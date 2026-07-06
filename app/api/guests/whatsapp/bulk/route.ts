import { NextResponse } from 'next/server';
import { createServerSupabase, verifyEventAccess } from '@/lib/supabase/server';
import { sendWhatsAppTemplate } from '@/lib/whatsapp';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { event_id, mode } = await req.json();

    if (!event_id || !['invite', 'remind'].includes(mode)) {
      return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
    }

    // Rate limiting (3 envois en masse par heure max)
    const { ok } = rateLimit(`whatsapp-bulk:${user.id}`, 3, 60 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: 'Trop de tentatives d\'envoi en masse. Réessayez plus tard.' }, { status: 429 });
    }


    // Vérifie la propriété de l'événement et son plan
    await verifyEventAccess(event_id);

    const { data: ev } = await supabase
      .from('events')
      .select('plan, slug')
      .eq('id', event_id)
      .single();

    if (!ev) {
      return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
    }

    if (ev.plan !== 'pro' && ev.plan !== 'premium') { // Assuming premium might also have it, but strict to pro is fine
      return NextResponse.json({ error: 'Fonctionnalité réservée au plan Pro.' }, { status: 403 });
    }

    // Récupérer les invités
    const { data: guests } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', event_id);

    if (!guests || guests.length === 0) {
      return NextResponse.json({ error: 'Aucun invité trouvé.' }, { status: 404 });
    }

    // Filtrer selon le mode
    // invite = envoyer à ceux qui n'ont pas encore reçu de message
    // remind = relancer ceux qui n'ont pas confirmé
    const targetGuests = guests.filter((g: any) => {
      if (!g.phone) return false;
      if (mode === 'invite') return !g.whatsapp_sent;
      if (mode === 'remind') return !g.rsvp_confirmed_at;
      return false;
    });

    if (targetGuests.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, errors: [], message: 'Aucun invité ne correspond aux critères.' });
    }

    const templateName = mode === 'invite' ? 'festara_invitation_v1' : 'festara_relance_v1';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host') || 'festara.app';
    const baseUrl = `${protocol}://${host}`;

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const guest of targetGuests) {
      const passUrl = `${baseUrl}/i/${ev.slug}?pass=${guest.pass_code}`;
      const params = [guest.first_name, passUrl];

      const res = await sendWhatsAppTemplate(guest.phone, templateName, 'fr', params);
      
      if (res.ok) {
        sentCount++;
        // Mettre à jour whatsapp_sent en base (important si c'était une invite)
        await supabase
          .from('guests')
          .update({ whatsapp_sent: true })
          .eq('id', guest.id);
      } else {
        failedCount++;
        errors.push(`Erreur pour ${guest.first_name}: ${res.error}`);
      }
    }

    return NextResponse.json({ sent: sentCount, failed: failedCount, errors });
  } catch (e: any) {
    console.error("bulk whatsapp error", e);
    return NextResponse.json({ error: e.message || 'Erreur interne' }, { status: 500 });
  }
}
