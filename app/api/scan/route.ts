import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminClient, verifyEventAccess } from '@/lib/supabase/server';

import { cookies } from 'next/headers';

// POST /api/scan
// Verifie un pass a l'entree. Reserve au proprietaire de l'evenement (auth) OU hôtesse (cookie).
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

  const admin = createAdminClient();
  let isAuthorized = false;

  // 1. Tenter l'autorisation via cookie magique (Hôtesse Sans Compte)
  const cookieStore = await cookies();
  const token = cookieStore.get('festara_scanner_token')?.value;
  if (token) {
    const { data: inv } = await admin
      .from('event_invitations')
      .select('event_id, role')
      .eq('token', token)
      .single();
    if (inv && inv.role === 'scanner' && inv.event_id === event_id) {
      isAuthorized = true;
    }
  }

  // 2. Si pas de cookie valide, tenter l'autorisation classique B2B (Compte Utilisateur)
  if (!isAuthorized) {
    try {
      await verifyEventAccess(event_id);
      isAuthorized = true;
    } catch (err: any) {
      return NextResponse.json({ error: 'Accès refusé. Non autorisé.' }, { status: 403 });
    }
  }

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
