import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { updateEvent } from '../actions';
import type { EventRow } from '@/lib/types';
import { TEMPLATES } from '@/components/templates';
import PayButton from '@/components/PayButton';

export const dynamic = 'force-dynamic';

type Props = { params: { id: string } };

export default async function EditEvent({ params }: Props) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (!data) notFound();
  const ev = data as EventRow;

  // Garantit 3 lignes de ceremonie editables (pre-remplies si existantes)
  const rows = Array.from({ length: 3 }, (_, i) => ev.ceremonies[i] ?? null);
  const action = updateEvent.bind(null, ev.id);

  const input = 'w-full rounded-lg px-3 min-h-[44px] border border-black/15 bg-white text-base';

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-festara-ink/60 underline">
          ← Mes invitations
        </Link>
        <div className="flex gap-4">
          <Link href={`/scan/${ev.id}`} className="text-sm text-festara-teal underline">
            Scanner les entrées
          </Link>
          <a href={`/api/export/${ev.id}`} className="text-sm text-festara-teal underline">
            Export CSV
          </a>
          <Link href={`/i/${ev.slug}`} target="_blank" className="text-sm text-festara-teal underline">
            Voir la page publique ↗
          </Link>
        </div>
      </div>

      <h1 className="mt-4 text-2xl font-bold text-festara-navy">Éditer l&apos;invitation</h1>
      <p className="text-sm text-festara-ink/50">
        Lien public : /i/{ev.slug}
      </p>

      <form action={action} className="mt-6 space-y-6">
        <div>
          <label className="text-sm font-medium">Titre</label>
          <input name="title" defaultValue={ev.title} className={input + ' mt-1'} />
        </div>

        <div>
          <label className="text-sm font-medium">Template</label>
          <select name="template" defaultValue={ev.template} className={input + ' mt-1'}>
            {Object.entries(TEMPLATES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-festara-navy">Cérémonies</p>
          {rows.map((c, i) => (
            <div key={i} className="rounded-xl border border-black/10 p-4 space-y-2">
              <input type="hidden" name={`cid_${i}`} defaultValue={c?.id || `c${i}`} />
              <input
                name={`name_${i}`}
                defaultValue={c?.name || ''}
                placeholder={`Cérémonie ${i + 1} (ex : Takk Dieul)`}
                className={input}
              />
              <div className="flex gap-2">
                <input type="date" name={`date_${i}`} defaultValue={c?.date || ''} className={input} />
                <input type="time" name={`time_${i}`} defaultValue={c?.time || ''} className={input} />
              </div>
              <input
                name={`location_${i}`}
                defaultValue={c?.location || ''}
                placeholder="Lieu (ex : King Fahd Palace, Dakar)"
                className={input}
              />
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" defaultChecked={ev.is_published} className="w-5 h-5" />
          Publier l&apos;invitation (visible publiquement)
        </label>

        <button className="btn-primary w-full">Enregistrer</button>
      </form>

      <div className="mt-10 border-t border-black/10 pt-6">
        <PayButton eventId={ev.id} currentPlan={ev.plan} />
      </div>
    </main>
  );
}
