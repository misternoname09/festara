import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminClient, verifyEventAccess } from '@/lib/supabase/server';

// POST /api/scan
// Verifie un pass a l'entree. Reserve au proprietaire de l'evenement (auth).
// Entree : { event_id, value }  ou value = pass_uuid (depuis QR) OU pass_code (6 car.)
// Sortie : { status: 'valid'|'already'|'unknown', guest? , scanned_at? }
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  const { event_id, value } = body || {};
  if (!event_id || !value) {
    return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 });
  }

  // Controle d'acces via la nouvelle fonction B2B
  try {
    await verifyEventAccess(event_id);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }

  const admin = createAdminClient();

  // Extrait un code/uuid d'une valeur QR (peut contenir une URL .../pass/<uuid>)
  const raw = String(value).trim();
  const uuidMatch = raw.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  const isUuid = !!uuidMatch;
  const lookup = isUuid ? uuidMatch![0] : raw.toUpperCase();

  const { data: guest } = await admin
    .from('guests')
    .select('id, first_name, party_size, scanned_at, ceremonies_attending')
    .eq('event_id', event_id)
    .eq(isUuid ? 'pass_uuid' : 'pass_code', lookup)
    .maybeSingle();

  if (!guest) {
    return NextResponse.json({ status: 'unknown' });
  }

  if (guest.scanned_at) {
    return NextResponse.json({
      status: 'already',
      guest: { first_name: guest.first_name, party_size: guest.party_size },
      scanned_at: guest.scanned_at,
    });
  }

  const now = new Date().toISOString();
  await admin
    .from('guests')
    .update({ scanned_at: now, checked_in_count: guest.party_size })
    .eq('id', guest.id);

  return NextResponse.json({
    status: 'valid',
    guest: { first_name: guest.first_name, party_size: guest.party_size },
    scanned_at: now,
  });
}
