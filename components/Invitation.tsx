'use client';

import { useState, useEffect } from 'react';
import type { EventRow, GuestbookMessageRow } from '@/lib/types';
import { TEMPLATES } from '@/components/templates';
import type { Ceremony } from '@/lib/types';

// Construit l'URL d'embed Google Maps sans cle API (iframe leger).
function mapsEmbedUrl(c: Ceremony): string {
  const q = encodeURIComponent(c.maps_url || c.location);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

// Formatage date FR court (ex: "vendredi 19 décembre 2026")
function formatDateFr(iso: string): string {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
import RsvpForm from '@/components/RsvpForm';
import Countdown from '@/components/Countdown';
import AddToCalendar from '@/components/AddToCalendar';
import GuestbookForm from '@/components/GuestbookForm';
import GuestbookList from '@/components/GuestbookList';

export default function Invitation({ event, messages = [] }: { event: EventRow, messages?: GuestbookMessageRow[] }) {
  const t = TEMPLATES[event.template] ?? TEMPLATES.modern;
  const isDark = event.template === 'arabic';

  let gallery: string[] = [];
  if (event.couple_photo_url) {
    try {
      const parsed = JSON.parse(event.couple_photo_url);
      if (Array.isArray(parsed) && parsed.length > 0) gallery = parsed;
      else if (event.couple_photo_url.length > 10) gallery = [event.couple_photo_url];
    } catch {
      if (event.couple_photo_url.length > 10) gallery = [event.couple_photo_url];
    }
  }

  // Image de bague de fiançailles par défaut (Unsplash haute qualité) si le client n'a pas encore mis de photo
  if (gallery.length === 0) {
    gallery = ["https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"];
  }

  // La première cérémonie sert pour le compte à rebours et l'ajout au calendrier
  const firstCeremony = event.ceremonies[0];

  const [isOpen, setIsOpen] = useState(false);
  
  // Animation d'ouverture
  useEffect(() => {
    // Delai pour l'effet "Wahou"
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 ${isDark ? 'bg-[#0A1226] text-white' : 'bg-festara-sand text-festara-navy'}`}>
        <div className="w-16 h-16 mb-8 relative animate-spin-slow">
           <div className="absolute inset-0 border-4 border-festara-gold/20 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-t-festara-gold rounded-full"></div>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-festara-gold animate-pulse">Ouverture de l'invitation...</p>
        <h1 className="text-4xl font-serif mt-6 opacity-80">{event.title}</h1>
      </div>
    );
  }

  return (
    <main className={`min-h-[120vh] relative overflow-hidden flex flex-col items-center py-8 sm:py-16 px-4 ${t.page}`}>
      {/* Ornements de fond luxueux */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white/5 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-black/5 blur-[100px] pointer-events-none"></div>

      <div className={`max-w-md w-full mx-auto rounded-[3rem] overflow-hidden relative z-10 animate-fade-in-up shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/10 ${t.card} ${t.font}`}>
        
        {/* HÉROS : Galerie avec Montage Décoratif et Compte à rebours */}
        <div className="relative w-full overflow-hidden pb-8">
          {/* Decorative background elements */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-festara-gold/20 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 pt-16 pb-6 px-6 flex flex-col items-center">
             
             {/* Ring Photo Accent (Floating) */}
             <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] border-festara-gold shadow-[0_10px_30px_rgba(197,154,69,0.4)] z-20 mb-[-2.5rem] bg-white relative animate-float">
                <img 
                  src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=400&auto=format&fit=crop" 
                  alt="Bague de fiançailles" 
                  className="w-full h-full object-cover"
                />
             </div>

             {/* Montage Photos */}
             {gallery.length === 1 ? (
               // One Image: Grand Arch
               <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-t-[10rem] overflow-hidden border-[6px] border-white shadow-2xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-festara-navy/40 to-transparent group-hover:opacity-0 transition-opacity duration-700 z-10"></div>
                  <img src={gallery[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000" loading="eager" />
               </div>
             ) : (
               // Multiple Images: Staggered Elegant Layout
               <div className="relative w-full h-[420px] sm:h-[480px] max-w-[340px] mx-auto mt-4">
                  {/* Image 1 (Back left) */}
                  <div className="absolute top-0 left-0 w-[65%] aspect-[3/4] rounded-t-[6rem] overflow-hidden border-[6px] border-white shadow-xl transform -rotate-6 hover:rotate-0 hover:z-30 transition-all duration-500 origin-bottom-left group">
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                     <img src={gallery[0]} alt="" className="w-full h-full object-cover" loading="eager" />
                  </div>
                  {/* Image 2 (Front right) */}
                  <div className="absolute top-12 right-0 w-[65%] aspect-[3/4] rounded-t-[6rem] overflow-hidden border-[6px] border-white shadow-2xl transform rotate-3 hover:rotate-0 hover:z-30 transition-all duration-500 origin-bottom-right z-20">
                     <img src={gallery[1]} alt="" className="w-full h-full object-cover" loading="eager" />
                  </div>
                  {/* Image 3 (Bottom center, circular accent) */}
                  {gallery[2] && (
                     <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[45%] aspect-square rounded-full overflow-hidden border-[4px] border-white shadow-lg transform hover:scale-110 hover:z-30 transition-all duration-500 z-30">
                        <img src={gallery[2]} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
               </div>
             )}
          </div>

          {/* Masque de fusion vers le bas */}
          <div className={`absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t ${isDark ? 'from-[#1A2A4A] to-transparent' : 'from-white to-transparent'} pointer-events-none z-10`}></div>
          
          {/* Le Compte à Rebours positionné harmonieusement sous le montage */}
          {firstCeremony && (
            <div className="relative z-20 px-4 mt-6">
              <Countdown targetDate={firstCeremony.date} isDark={isDark} />
            </div>
          )}
        </div>

        <div className="px-8 pb-16 pt-6 text-center relative z-20">
          <p className={`uppercase tracking-[0.35em] text-[10px] font-bold mb-4 opacity-80 ${t.accent}`}>
            Vous êtes convié(e)
          </p>
          <h1 className={`text-5xl sm:text-6xl leading-[1.1] mb-2 ${t.title}`}>{event.title}</h1>
          
          {firstCeremony && (
            <AddToCalendar title={event.title} date={firstCeremony.date} location={firstCeremony.location} isDark={isDark} />
          )}

          {event.welcome_message && (
            <div className={`mt-10 mb-8 text-[15px] leading-[1.8] whitespace-pre-wrap opacity-90 font-medium px-2 ${t.font} ${isDark ? 'text-white' : 'text-festara-navy'}`}>
              {event.welcome_message}
            </div>
          )}
          
          <div className="flex items-center justify-center gap-6 my-10 opacity-50">
            <div className={`h-px w-16 ${isDark ? 'bg-white' : 'bg-black'}`}></div>
            <p className={`text-sm ${t.accent}`}>⚜</p>
            <div className={`h-px w-16 ${isDark ? 'bg-white' : 'bg-black'}`}></div>
          </div>

          {/* Cérémonies - Style Billet VIP */}
          <div className="space-y-8 text-left relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-current before:to-transparent before:opacity-10">
            {event.ceremonies.map((c, idx) => (
              <div
                key={c.id}
                className={`relative rounded-3xl p-7 overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-2xl ${isDark ? 'bg-white/5 border-white/10 shadow-black/50' : 'bg-white border-black/5 shadow-black/5'}`}
              >
                {/* Ligne pointillée effet ticket */}
                <div className="absolute left-6 top-0 bottom-0 w-px border-l-2 border-dashed opacity-20 border-current"></div>
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 rounded-r-full ${isDark ? 'bg-[#1A2A4A]' : 'bg-[#F9F6F0]'}`}></div>
                
                <div className="pl-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'bg-white/10 text-white' : 'bg-festara-navy/5 text-festara-navy'}`}>
                    Étape {idx + 1}
                  </span>
                  <h2 className={`text-2xl mb-2 ${t.title}`}>{c.name}</h2>
                  <p className={`text-sm font-semibold tracking-wide ${isDark ? 'text-festara-gold' : 'text-festara-teal'}`}>
                    {formatDateFr(c.date)}
                    {c.time ? ` · ${c.time}` : ''}
                  </p>
                  <p className={`text-sm mt-2 mb-5 opacity-80 ${isDark ? 'text-white' : 'text-festara-ink'}`}>{c.location}</p>
                  <iframe
                    title={`Carte ${c.name}`}
                    src={mapsEmbedUrl(c)}
                    className="w-full h-32 rounded-2xl border-0 opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 my-12 opacity-50">
            <div className={`h-px w-16 ${isDark ? 'bg-white' : 'bg-black'}`}></div>
            <p className={`text-sm ${t.accent}`}>⚜</p>
            <div className={`h-px w-16 ${isDark ? 'bg-white' : 'bg-black'}`}></div>
          </div>

          {/* RSVP Magique */}
          <div className="mt-8 relative z-30">
            <h3 className={`text-3xl mb-8 ${t.title}`}>Confirmez votre présence</h3>
            <RsvpForm
              eventId={event.id}
              ceremonies={event.ceremonies}
              dark={isDark}
            />
          </div>

          {/* Livre d'Or (Guestbook) */}
          <div className="mt-16 pt-16 border-t border-current opacity-90 text-center relative z-30">
            <h3 className={`text-4xl mb-4 ${t.title}`}>Livre d'Or</h3>
            <p className={`text-sm mb-10 opacity-80 ${t.font}`}>Laissez un petit mot d'amour aux mariés.</p>
            
            <div className="mb-12">
              <GuestbookForm eventId={event.id} isDark={isDark} />
            </div>

            {messages.length > 0 && (
              <div className="mt-12">
                <h4 className={`text-lg font-bold mb-6 text-left uppercase tracking-widest ${isDark ? 'text-festara-gold' : 'text-festara-navy'}`}>Mots des invités</h4>
                <GuestbookList messages={messages} isDark={isDark} />
              </div>
            )}
          </div>

          {/* CTA Festara Marketing */}
          <div className="mt-16 pt-10 border-t border-current opacity-90 text-center pb-4">
            <p className={`text-sm mb-5 font-medium opacity-80`}>Votre histoire mérite aussi d'être célébrée.</p>
            <a href="/" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-2xl ${isDark ? 'bg-gradient-to-r from-[#C59A45] to-[#DFB769] text-white hover:shadow-[#C59A45]/30' : 'bg-gradient-to-r from-festara-navy to-[#1A2A4A] text-white hover:shadow-festara-navy/30'}`}>
              Créer mon faire-part <span className="text-lg leading-none">✨</span>
            </a>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mt-12 opacity-20">
              Festara • Yëgël
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
