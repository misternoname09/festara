import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const token = params.token;
  
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const adminClient = createAdminClient();

  // Chercher l'invitation
  const { data: eventInv } = await adminClient
    .from('event_invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (!eventInv || eventInv.role !== 'scanner') {
    // Si ce n'est pas un token valide ou pas pour un scanner
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Marquer l'invitation comme acceptée si ce n'est pas déjà fait
  if (!eventInv.accepted_at) {
    await adminClient
      .from('event_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', eventInv.id);
  }

  // Définir le cookie de session scanner magique (valable 30 jours)
  const cookieStore = await cookies();
  cookieStore.set('festara_scanner_token', token, {
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  // Rediriger vers la page du scanner
  return NextResponse.redirect(new URL(`/scan/${eventInv.event_id}`, request.url));
}
