import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createAdminClient, verifyEventAccess } from '@/lib/supabase/server';
import ScannerWrapper from '@/components/ScannerWrapper';
import type { EventRow, EventStats } from '@/lib/types';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ eventId: string }> };

export default async function ScanPage(props: Props) {
  const params = await props.params;
  const eventId = params.eventId;

  let isAuthorized = false;

  // 1. Tenter l'autorisation classique (compte utilisateur)
  try {
    await verifyEventAccess(eventId);
    isAuthorized = true;
  } catch (err) {
    // Échec de l'accès classique
  }

  // 2. Si pas d'accès classique, vérifier le token magique de l'hôtesse
  const adminClient = createAdminClient();
  if (!isAuthorized) {
    const cookieStore = await cookies();
    const token = cookieStore.get('festara_scanner_token')?.value;
    if (token) {
      const { data: inv } = await adminClient
        .from('event_invitations')
        .select('event_id, role')
        .eq('token', token)
        .single();
      
      if (inv && inv.role === 'scanner' && inv.event_id === eventId) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    // Pas de cookie valide, ni de compte valide.
    redirect('/login');
  }

  // Comme l'hôtesse n'a peut-être pas de compte Supabase, on utilise adminClient 
  // pour récupérer les données de l'événement en contournant RLS.
  const { data } = await adminClient
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();
  if (!data) notFound();
  const ev = data as EventRow;

  const { data: stat } = await adminClient
    .from('event_stats')
    .select('*')
    .eq('event_id', ev.id)
    .maybeSingle();
  const s = stat as EventStats | null;

  const { data: guestsData } = await adminClient
    .from('guests')
    .select('pass_uuid, pass_code, first_name, party_size, scanned_at, rsvp_confirmed_at')
    .eq('event_id', ev.id)
    .not('rsvp_confirmed_at', 'is', null);
    
  const guests = guestsData || [];

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <div className="mx-auto w-full max-w-lg min-h-screen flex flex-col items-center justify-center relative z-10 px-0 sm:px-4 pb-12 sm:py-12">
        <div className="w-full h-full flex flex-col justify-center sm:bg-white/5 sm:border sm:border-white/10 sm:backdrop-blur-md sm:rounded-[2.5rem] sm:p-8">
          <ScannerWrapper
            eventId={ev.id}
            eventTitle={ev.title}
            initialScanned={s?.guests_scanned ?? 0}
            total={s?.guests_confirmed ?? 0}
            guests={guests}
          />
        </div>
      </div>
    </main>
  );
}
