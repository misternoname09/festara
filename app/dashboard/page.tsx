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
    <main className="min-h-screen bg-[#FDFBF7] relative overflow-hidden flex flex-col font-sans pb-32">
      {/* --- HERITAGE LUXURY BACKGROUND --- */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[#0A1226] rounded-b-[4rem] sm:rounded-b-[6rem] shadow-2xl pointer-events-none z-0 overflow-hidden">
        {/* Animated glowing orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-festara-gold/15 blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-festara-teal/20 blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      <div className="max-w-6xl mx-auto w-full px-6 pt-16 pb-12 relative z-10 animate-fade-in-up">
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-6 text-white">
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-festara-gold/30 bg-festara-gold/10 backdrop-blur-md mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-festara-gold animate-pulse"></span>
              <span className="text-festara-gold text-[10px] font-bold uppercase tracking-[0.2em]">Espace Organisateur</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight leading-tight">
              Vos Événements <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DFB769] to-[#C59A45] italic pr-2">Prestigieux.</span>
            </h1>
          </div>
          <form action={signOut} className="sm:self-start mt-2">
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span>Déconnexion</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </form>
        </div>

        {/* --- CREATION ACTION WIDGET --- */}
        <div className="bg-gradient-to-br from-white to-white/90 rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white mb-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-festara-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 bg-festara-sand/30 rounded-[2rem] p-6 sm:p-8">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-festara-navy font-serif mb-2">Initier une Célébration</h2>
              <p className="text-sm text-festara-ink/60 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
                Configurez une nouvelle invitation numérique de luxe, personnalisez le design et éblouissez vos convives.
              </p>
            </div>

            <form action={createEvent} className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  name="title"
                  placeholder="Ex : Mariage de Aïda & Modou"
                  className="w-full bg-white border-2 border-transparent hover:border-black/5 focus:border-festara-gold/50 rounded-2xl px-6 min-h-[60px] text-festara-navy placeholder:text-festara-ink/30 outline-none shadow-sm transition-all font-medium"
                  required
                />
              </div>
              <button className="bg-[#0A1226] hover:bg-[#121e3b] text-white px-8 rounded-2xl flex items-center justify-center gap-3 min-h-[60px] font-bold uppercase tracking-wider text-xs transition-all hover:shadow-[0_10px_20px_rgba(10,18,38,0.2)] hover:-translate-y-0.5 group/btn">
                <span className="group-hover/btn:rotate-12 transition-transform duration-300">✨</span> 
                Créer l'Événement
              </button>
            </form>
          </div>
        </div>

        {/* --- EVENTS GRID --- */}
        <div className="space-y-8">
          {list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
               <div className="w-28 h-28 mb-8 rounded-full bg-white shadow-xl flex items-center justify-center text-5xl border-[8px] border-festara-sand relative animate-float">
                 <div className="absolute inset-0 rounded-full border-2 border-festara-gold/30 scale-110 animate-ping" style={{ animationDuration: '3s' }}></div>
                 💍
               </div>
               <h3 className="text-3xl font-serif font-bold text-festara-navy mb-4">Votre galerie est vide</h3>
               <p className="text-festara-ink/60 font-medium max-w-md text-lg">Utilisez le module ci-dessus pour générer votre première invitation digitale et lancer la magie.</p>
            </div>
          )}

          {list.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {list.map((ev) => {
                const s = statMap.get(ev.id);
                return (
                  <Link
                    key={ev.id}
                    href={`/dashboard/${ev.id}`}
                    className="group bg-white rounded-[2rem] border border-black/5 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 flex flex-col relative overflow-hidden"
                  >
                    {/* Decorative Header Area of Card */}
                    <div className="h-24 w-full bg-gradient-to-br from-festara-sand to-festara-sand/50 relative overflow-hidden">
                       <div className="absolute -right-10 -top-10 w-32 h-32 bg-festara-gold/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                       {/* Status Badge */}
                       <div className="absolute top-5 right-5 z-10">
                         <span
                            className={`text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border shadow-sm ${
                              ev.is_published
                                ? 'bg-white text-green-600 border-green-200'
                                : 'bg-white text-amber-600 border-amber-200'
                            }`}
                          >
                            {ev.is_published ? 'Publiée' : 'Brouillon'}
                          </span>
                       </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between">
                      {/* Avatar/Icon overlap */}
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-black/5 flex items-center justify-center text-xl -mt-7 mb-4 relative z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                        {ev.title.toLowerCase().includes('bapt') ? '👶' : '🥂'}
                      </div>
                      
                      <h3 className="font-serif text-2xl font-bold text-festara-navy mb-6 line-clamp-2">
                        {ev.title}
                      </h3>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-festara-sand/30 group-hover:bg-festara-sand/80 transition-colors">
                          <span className="text-xl font-bold text-festara-navy">{s?.guests_confirmed ?? 0}</span>
                          <span className="text-[8px] font-bold text-festara-ink/50 uppercase tracking-widest mt-1">Invités</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-festara-sand/30 group-hover:bg-festara-sand/80 transition-colors">
                          <span className="text-xl font-bold text-festara-teal">{s?.people_confirmed ?? 0}</span>
                          <span className="text-[8px] font-bold text-festara-ink/50 uppercase tracking-widest mt-1">Total</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0A1226]/5 group-hover:bg-[#0A1226]/10 transition-colors">
                          <span className="text-xl font-bold text-[#0A1226]">{s?.guests_scanned ?? 0}</span>
                          <span className="text-[8px] font-bold text-festara-ink/50 uppercase tracking-widest mt-1">Scans</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover animated border line at bottom */}
                    <div className="absolute bottom-0 left-0 h-1 bg-festara-gold w-0 group-hover:w-full transition-all duration-500"></div>
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
