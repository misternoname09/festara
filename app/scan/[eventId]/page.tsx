import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import Scanner from '@/components/Scanner';
import type { EventRow, EventStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ eventId: string }> };

export default async function ScanPage(props: Props) {
  const params = await props.params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verifie la propriete de l'evenement (RLS le garantit aussi)
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.eventId)
    .maybeSingle();
  if (!data) notFound();
  const ev = data as EventRow;

  const { data: stat } = await supabase
    .from('event_stats')
    .select('*')
    .eq('event_id', ev.id)
    .maybeSingle();
  const s = stat as EventStats | null;

  const { data: guestsData } = await supabase
    .from('guests')
    .select('pass_uuid, pass_code, first_name, party_size, scanned_at, rsvp_confirmed_at')
    .eq('event_id', ev.id)
    .not('rsvp_confirmed_at', 'is', null);
    
  const guests = guestsData || [];

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <div className="mx-auto w-full max-w-lg min-h-screen flex flex-col items-center justify-center relative z-10 px-0 sm:px-4 pb-12 sm:py-12">
        <div className="w-full h-full flex flex-col justify-center sm:bg-white/5 sm:border sm:border-white/10 sm:backdrop-blur-md sm:rounded-[2.5rem] sm:p-8">
          <Scanner
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
