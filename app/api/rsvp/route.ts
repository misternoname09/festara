import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// POST /api/rsvp
// Cree un invite (RSVP) cote serveur avec le service_role (l'invite est anonyme,
// pas de compte). Le pass_code et le pass_uuid sont generes par la base.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const { event_id, first_name, party_size, ceremonies_attending } = body || {};

  if (!event_id || typeof first_name !== 'string' || !first_name.trim()) {
    return NextResponse.json({ error: 'Prénom requis.' }, { status: 400 });
  }
  const size = Math.min(Math.max(parseInt(party_size, 10) || 1, 1), 20);

  // Mode demo : pas d'ecriture en base, on renvoie un pass factice.
  if (event_id === 'demo') {
    return NextResponse.json({
      pass_uuid: '00000000-0000-0000-0000-000000000000',
      pass_code: 'DEMO24',
    });
  }

  const supabase = createAdminClient();

  // Verifie que l'evenement existe et est publie (anti-spam basique).
  const { data: ev } = await supabase
    .from('events')
    .select('id')
    .eq('id', event_id)
    .eq('is_published', true)
    .maybeSingle();

  if (!ev) {
    return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('guests')
    .insert({
      event_id,
      first_name: first_name.trim().slice(0, 80),
      party_size: size,
      ceremonies_attending: Array.isArray(ceremonies_attending)
        ? ceremonies_attending.slice(0, 10)
        : [],
      rsvp_confirmed_at: new Date().toISOString(),
    })
    .select('pass_uuid, pass_code')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 });
  }

  return NextResponse.json(data);
}
