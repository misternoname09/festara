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
    <main className="min-h-screen px-4 py-6">
      <Link href={`/dashboard/${ev.id}`} className="text-sm text-festara-ink/60 underline">
        ← Retour
      </Link>
      <div className="mt-4">
        <Scanner
          eventId={ev.id}
          eventTitle={ev.title}
          initialScanned={s?.guests_scanned ?? 0}
          total={s?.guests_confirmed ?? 0}
        />
      </div>
    </main>
  );
}
