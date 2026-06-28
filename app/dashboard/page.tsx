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
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: stats } = await supabase.from('event_stats').select('*');
  const statMap = new Map((stats as EventStats[] | null)?.map((s) => [s.event_id, s]) ?? []);

  const list = (events as EventRow[] | null) ?? [];

  return (
    <main className="min-h-screen bg-festara-sand relative overflow-hidden flex flex-col font-sans pb-20">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-festara-navy to-festara-navy/90 rounded-b-[4rem] shadow-2xl pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-festara-gold/10 blur-[100px] pointer-events-none animate-float"></div>
      
      <div className="max-w-6xl mx-auto w-full px-6 py-12 relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 text-white">
          <div>
            <p className="text-festara-gold text-sm font-bold uppercase tracking-widest mb-1">Espace Organisateur</p>
            <h1 className="text-4xl font-bold font-serif">Vos Événements Prestigieux</h1>
          </div>
          <form action={signOut}>
            <button className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-none text-sm px-6">
              Déconnexion
            </button>
          </form>
        </div>

        {/* Action Bar (Nouvelle invitation) */}
        <div className="glass bg-white/95 rounded-[2rem] p-6 shadow-xl border border-black/5 mb-12 flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden group">
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-festara-gold/10 rounded-full blur-2xl group-hover:bg-festara-gold/20 transition-colors pointer-events-none"></div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-festara-navy font-serif">Nouveau Mariage</h2>
            <p className="text-sm text-festara-ink/60 font-medium">Commencez à configurer une nouvelle invitation numérique de luxe.</p>
          </div>

          <form action={createEvent} className="flex w-full md:w-auto gap-2">
            <input
              name="title"
              placeholder="Ex : Aïda & Modou"
              className="w-full md:w-72 bg-festara-sand/50 border border-black/5 rounded-xl px-5 min-h-[50px] text-festara-navy placeholder:text-festara-ink/30 outline-none focus:ring-2 focus:ring-festara-gold/50 transition-all font-medium"
            />
            <button className="btn-primary px-8 rounded-xl flex items-center gap-2 whitespace-nowrap">
              <span>✨</span> Créer
            </button>
          </form>
        </div>

        {/* Grille des Événements */}
        <div className="space-y-8">
          {list.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16 text-center">
               <div className="w-24 h-24 mb-6 rounded-full bg-festara-navy/5 flex items-center justify-center text-4xl">💍</div>
               <h3 className="text-2xl font-serif font-bold text-festara-navy mb-2">Aucune invitation pour le moment</h3>
               <p className="text-festara-ink/60 font-medium max-w-md">Utilisez le formulaire ci-dessus pour générer votre première invitation digitale et impressionner vos invités.</p>
            </div>
          )}

          {list.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((ev) => {
                const s = statMap.get(ev.id);
                return (
                  <Link
                    key={ev.id}
                    href={`/dashboard/${ev.id}`}
                    className="group glass bg-white/80 hover:bg-white rounded-[2rem] p-6 border border-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-festara-gold/0 via-transparent to-festara-gold/0 group-hover:to-festara-gold/10 transition-colors duration-500 pointer-events-none"></div>

                    <div>
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <span
                          className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${
                            ev.is_published
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}
                        >
                          {ev.is_published ? 'Publiée' : 'Brouillon'}
                        </span>
                        
                        <span className="text-festara-ink/20 group-hover:text-festara-gold transition-colors">
                           ↗
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-2xl font-bold text-festara-navy mb-6 relative z-10">
                        {ev.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-black/5 pt-4 relative z-10">
                      <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-festara-sand/50 group-hover:bg-white transition-colors">
                        <span className="text-lg font-bold text-festara-navy">{s?.guests_confirmed ?? 0}</span>
                        <span className="text-[9px] font-bold text-festara-ink/40 uppercase tracking-wider mt-0.5">Invités</span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-festara-sand/50 group-hover:bg-white transition-colors">
                        <span className="text-lg font-bold text-festara-teal">{s?.people_confirmed ?? 0}</span>
                        <span className="text-[9px] font-bold text-festara-ink/40 uppercase tracking-wider mt-0.5">Total</span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-festara-sand/50 group-hover:bg-white transition-colors">
                        <span className="text-lg font-bold text-festara-gold">{s?.guests_scanned ?? 0}</span>
                        <span className="text-[9px] font-bold text-festara-ink/40 uppercase tracking-wider mt-0.5">Scans</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
