import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { updateProfile } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const fullName = user.user_metadata?.full_name || '';
  const phone = user.user_metadata?.phone || '';
  const companyName = user.user_metadata?.company_name || '';
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '👤';

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
      `}} />

      {/* --- PRESTIGE BACKGROUND --- */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#050B14] to-[#0A1226] rounded-b-[4rem] sm:rounded-b-[8rem] shadow-[0_20px_60px_rgba(10,18,38,0.2)] pointer-events-none z-0 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(197,154,69,0.15)_0%,transparent_60%)] blur-[80px] animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_60%)] blur-[60px]"></div>
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
      </div>
      
      <div className="max-w-3xl mx-auto w-full px-6 pt-20 pb-12 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col items-center justify-center mb-16 gap-6 text-white opacity-0 animate-fade-in-up" style={{ animationDelay: '0s' }}>
          <Link href="/dashboard" className="group inline-flex items-center gap-2 text-[10px] font-bold text-white/50 hover:text-white transition-all duration-300 uppercase tracking-[0.2em] bg-white/5 border border-white/10 hover:border-white/30 hover:shadow-sm px-4 py-2 rounded-full self-start mb-4">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <span className="text-xs leading-none -translate-y-[1px] group-hover:-translate-x-0.5 transition-transform">←</span>
            </div>
            Retour au Dashboard
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-festara-gold/30 bg-black/30 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(197,154,69,0.15)] mx-auto">
              <span className="w-2 h-2 rounded-full bg-festara-gold animate-ping"></span>
              <span className="text-festara-gold text-[11px] font-bold uppercase tracking-[0.3em]">Profil Utilisateur</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-serif tracking-tight leading-[1.1]">
              Mes Informations <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-festara-gold via-[#DFB769] to-festara-gold italic pr-4 drop-shadow-sm">Personnelles.</span>
            </h1>
          </div>
        </div>

        {/* --- FORM WIDGET --- */}
        <div className="relative mb-24 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-festara-gold/40 via-white/50 to-festara-gold/40 rounded-[3rem] blur-xl opacity-40"></div>
          
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white relative overflow-hidden group">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:animate-shimmer pointer-events-none transition-all"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-festara-gold to-[#DFB769] p-[2px] shadow-[0_0_30px_rgba(197,154,69,0.3)] shrink-0 mb-8 group/avatar relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/avatar:animate-shimmer pointer-events-none"></div>
                <div className="w-full h-full bg-[#0A1226] rounded-full flex items-center justify-center relative z-10">
                  <span className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-festara-gold to-[#DFB769]">{initials}</span>
                </div>
              </div>

              <form action={updateProfile} className="w-full max-w-md space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-bold text-festara-navy uppercase tracking-widest mb-2">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    defaultValue={fullName}
                    placeholder="Ex: Amadou Ndiaye"
                    required
                    className="w-full bg-[#FDFBF7] border-2 border-[#0A1226]/5 focus:border-festara-gold focus:bg-white rounded-2xl px-6 py-4 text-[#0A1226] placeholder:text-[#0A1226]/30 outline-none shadow-inner transition-all font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-festara-navy uppercase tracking-widest mb-2">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={phone}
                    placeholder="Ex: +221 77 123 45 67"
                    className="w-full bg-[#FDFBF7] border-2 border-[#0A1226]/5 focus:border-festara-gold focus:bg-white rounded-2xl px-6 py-4 text-[#0A1226] placeholder:text-[#0A1226]/30 outline-none shadow-inner transition-all font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="company_name" className="block text-sm font-bold text-festara-navy uppercase tracking-widest mb-2">
                    Nom de l'Agence / Entreprise <span className="text-xs text-festara-navy/50 normal-case tracking-normal">(Optionnel)</span>
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    defaultValue={companyName}
                    placeholder="Ex: Festara Agency"
                    className="w-full bg-[#FDFBF7] border-2 border-[#0A1226]/5 focus:border-festara-gold focus:bg-white rounded-2xl px-6 py-4 text-[#0A1226] placeholder:text-[#0A1226]/30 outline-none shadow-inner transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-festara-navy uppercase tracking-widest mb-2">
                    Adresse Email (Lecture Seule)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-[#FDFBF7]/50 border-2 border-[#0A1226]/5 rounded-2xl px-6 py-4 text-[#0A1226]/50 outline-none font-medium cursor-not-allowed"
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-gradient-to-r from-[#0A1226] to-[#1a2c5b] hover:from-[#121e3b] hover:to-[#223870] text-white px-10 rounded-2xl flex items-center justify-center gap-3 py-5 font-bold uppercase tracking-widest text-sm transition-all hover:shadow-[0_15px_30px_rgba(10,18,38,0.3)] hover:-translate-y-1 group/btn relative overflow-hidden">
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                    <span>Enregistrer les modifications</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
