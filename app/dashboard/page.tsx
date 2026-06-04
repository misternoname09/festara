import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { createEvent, signOut } from './actions';
import type { EventRow, EventStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: stats } = await supabase.from('event_stats').select('*');
  const statMap = new Map((stats as EventStats[] | null)?.map((s) => [s.event_id, s]) ?? []);

  const list = (events as EventRow[] | null) ?? [];

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-festara-navy">Mes invitations</h1>
        <form action={signOut}>
          <button className="text-sm text-festara-ink/60 underline">Déconnexion</button>
        </form>
      </div>

      {/* Nouvelle invitation */}
      <form action={createEvent} className="mt-6 flex gap-2">
        <input
          name="title"
          placeholder="Nom du mariage (ex : Aïda & Modou)"
          className="flex-1 rounded-lg px-3 min-h-[48px] border border-black/15 bg-white text-base"
        />
        <button className="btn-primary">Créer</button>
      </form>

      {/* Liste */}
      <div className="mt-8 space-y-3">
        {list.length === 0 && (
          <p className="text-festara-ink/50 text-sm">
            Aucune invitation pour l&apos;instant. Crée la première ci-dessus.
          </p>
        )}
        {list.map((ev) => {
          const s = statMap.get(ev.id);
          return (
            <Link
              key={ev.id}
              href={`/dashboard/${ev.id}`}
              className="block bg-white rounded-xl p-4 border border-black/5 hover:border-festara-navy/30"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-festara-navy">{ev.title}</span>
                <span
                  className={
                    'text-xs px-2 py-1 rounded-full ' +
                    (ev.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700')
                  }
                >
                  {ev.is_published ? 'Publiée' : 'Brouillon'}
                </span>
              </div>
              <p className="mt-2 text-sm text-festara-ink/60">
                {s?.guests_confirmed ?? 0} confirmés · {s?.people_confirmed ?? 0} personnes ·{' '}
                {s?.guests_scanned ?? 0} scannés
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
