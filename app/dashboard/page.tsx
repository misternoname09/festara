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
    <main className="min-h-screen bg-[#FDFBF7] relative overflow-hidden flex flex-col font-sans pb-32 selection:bg-festara-gold selection:text-white">
      {/* --- CSS Animations Inline --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 15s linear infinite;
        }
      `}} />

      {/* --- PRESTIGE BACKGROUND --- */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#050B14] to-[#0A1226] rounded-b-[4rem] sm:rounded-b-[8rem] shadow-[0_20px_60px_rgba(10,18,38,0.2)] pointer-events-none z-0 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(197,154,69,0.15)_0%,transparent_60%)] blur-[80px] animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_60%)] blur-[60px]"></div>
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
      </div>
      
      <div className="max-w-6xl mx-auto w-full px-6 pt-20 pb-12 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-20 gap-8 text-white opacity-0 animate-fade-in-up" style={{ animationDelay: '0s' }}>
          <div className="relative">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-festara-gold/30 bg-black/30 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(197,154,69,0.15)]">
              <span className="w-2 h-2 rounded-full bg-festara-gold animate-ping"></span>
              <span className="text-festara-gold text-[11px] font-bold uppercase tracking-[0.3em]">Espace Organisateur</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight leading-[1.1]">
              Vos Événements <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-festara-gold via-[#DFB769] to-festara-gold italic pr-4 drop-shadow-sm">Prestigieux.</span>
            </h1>
          </div>
          <form action={signOut} className="sm:self-start mt-2">
            <button className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10 rounded-full transition-all font-medium text-sm hover:border-festara-gold/50 hover:shadow-[0_0_20px_rgba(197,154,69,0.2)]">
              <span className="tracking-wide">Déconnexion</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </form>
        </div>

        {/* --- CREATION ACTION WIDGET --- */}
        <div className="relative mb-24 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-festara-gold/40 via-white/50 to-festara-gold/40 rounded-[3rem] blur-xl opacity-40"></div>
          
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white relative overflow-hidden group">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:animate-shimmer pointer-events-none transition-all"></div>

            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-festara-sand to-festara-gold/20 mb-6 shadow-inner border border-white">
                  <span className="text-2xl drop-shadow-sm">✨</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1226] font-serif mb-4">Initier une Célébration</h2>
                <p className="text-[#0A1226]/60 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed text-base">
                  Configurez une nouvelle invitation numérique de luxe, personnalisez le design et éblouissez vos convives.
                </p>
              </div>

              <form action={createEvent} className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
                <div className="relative w-full sm:w-96">
                  <input
                    name="title"
                    placeholder="Ex : Mariage de Aïda & Modou"
                    className="w-full bg-[#FDFBF7] border-2 border-[#0A1226]/5 focus:border-festara-gold focus:bg-white rounded-2xl px-6 py-5 text-[#0A1226] placeholder:text-[#0A1226]/30 outline-none shadow-inner transition-all font-medium text-lg"
                    required
                  />
                </div>
                <button className="bg-gradient-to-r from-[#0A1226] to-[#1a2c5b] hover:from-[#121e3b] hover:to-[#223870] text-white px-10 rounded-2xl flex items-center justify-center gap-3 py-5 font-bold uppercase tracking-widest text-sm transition-all hover:shadow-[0_15px_30px_rgba(10,18,38,0.3)] hover:-translate-y-1 group/btn relative overflow-hidden">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                  <span>Créer l'Événement</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* --- EVENTS GRID --- */}
        <div className="space-y-8 relative z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
               <div className="relative w-36 h-36 mb-12 flex items-center justify-center group">
                 <div className="absolute inset-0 bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
                 <div className="absolute inset-0 bg-gradient-to-br from-white to-festara-sand rounded-[2rem] shadow-inner -rotate-3 group-hover:-rotate-6 transition-transform duration-500"></div>
                 <div className="absolute inset-3 border-2 border-dashed border-festara-gold/40 rounded-3xl animate-slow-spin"></div>
                 <span className="text-5xl relative z-10 animate-bounce" style={{ animationDuration: '3s' }}>💍</span>
               </div>
               <h3 className="text-4xl font-serif font-bold text-[#0A1226] mb-4">Votre galerie est vide</h3>
               <p className="text-[#0A1226]/50 font-medium max-w-md text-lg mx-auto leading-relaxed">
                 Utilisez le module ci-dessus pour générer votre première invitation digitale et lancer la magie.
               </p>
            </div>
          )}

          {list.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((ev) => {
                const s = statMap.get(ev.id);
                return (
                  <Link
                    key={ev.id}
                    href={`/dashboard/${ev.id}`}
                    className="group bg-white rounded-[2.5rem] border border-black/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 flex flex-col relative overflow-hidden"
                  >
                    {/* Decorative Header Area of Card */}
                    <div className="h-32 w-full bg-gradient-to-br from-festara-sand to-festara-sand/50 relative overflow-hidden">
                       <div className="absolute -right-12 -top-12 w-40 h-40 bg-festara-gold/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                       <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#0A1226]/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                       {/* Status Badge */}
                       <div className="absolute top-6 right-6 z-10">
                         <span
                            className={`text-[9px] px-4 py-2 rounded-full font-bold uppercase tracking-[0.2em] shadow-sm backdrop-blur-md ${
                              ev.is_published
                                ? 'bg-green-500/10 text-green-700 border border-green-500/20'
                                : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                            }`}
                          >
                            {ev.is_published ? 'Publiée' : 'Brouillon'}
                          </span>
                       </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 pt-0 relative flex-1 flex flex-col justify-between">
                      {/* Avatar/Icon overlap */}
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-black/5 flex items-center justify-center text-2xl -mt-8 mb-6 relative z-10 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                        {ev.title.toLowerCase().includes('bapt') ? '👶' : '🥂'}
                      </div>
                      
                      <h3 className="font-serif text-2xl lg:text-3xl font-bold text-[#0A1226] mb-8 line-clamp-2 leading-tight group-hover:text-festara-gold transition-colors">
                        {ev.title}
                      </h3>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center justify-center py-4 rounded-2xl bg-festara-sand/30 group-hover:bg-festara-sand/80 transition-colors">
                          <span className="text-2xl font-bold text-[#0A1226]">{s?.guests_confirmed ?? 0}</span>
                          <span className="text-[9px] font-bold text-[#0A1226]/40 uppercase tracking-widest mt-1">Invités</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-4 rounded-2xl bg-gradient-to-b from-festara-gold/5 to-festara-gold/10 group-hover:from-festara-gold/10 group-hover:to-festara-gold/20 transition-colors">
                          <span className="text-2xl font-bold text-festara-gold">{s?.people_confirmed ?? 0}</span>
                          <span className="text-[9px] font-bold text-festara-gold/60 uppercase tracking-widest mt-1">Total</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-4 rounded-2xl bg-[#0A1226]/5 group-hover:bg-[#0A1226]/10 transition-colors">
                          <span className="text-2xl font-bold text-[#0A1226]">{s?.guests_scanned ?? 0}</span>
                          <span className="text-[9px] font-bold text-[#0A1226]/40 uppercase tracking-widest mt-1">Scans</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover animated border line at bottom */}
                    <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-festara-gold to-[#DFB769] w-0 group-hover:w-full transition-all duration-700 ease-in-out"></div>
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
