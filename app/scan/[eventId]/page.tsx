import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import Scanner from '@/components/Scanner';
import type { EventRow, EventStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = { params: { eventId: string } };

export default async function ScanPage({ params }: Props) {
  const supabase = createServerSupabase();
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

  return (
    <main className="min-h-screen bg-[#0A1226] text-white relative overflow-hidden font-sans">
      {/* Background Ornaments (Mode Nuit pour l'extérieur) */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-festara-gold/10 blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-md mx-auto px-4 py-12 relative z-10 flex flex-col justify-center min-h-screen">
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
          <Scanner
            eventId={ev.id}
            eventTitle={ev.title}
            initialScanned={s?.guests_scanned ?? 0}
            total={s?.guests_confirmed ?? 0}
          />
        </div>

        <p className="text-center text-white/30 text-[10px] uppercase tracking-widest mt-8 font-semibold">
          Interface Agent de Sécurité — Festara
        </p>
      </div>
    </main>
  );
}
