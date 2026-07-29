'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { EventRow, GuestbookMessageRow } from '@/lib/types';
import { TEMPLATES } from '@/components/templates';
import type { Ceremony } from '@/lib/types';
import { DICTIONARY, Language } from '@/lib/i18n';

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
import Link from 'next/link';
import RsvpForm from '@/components/RsvpForm';
import Countdown from '@/components/Countdown';
import AddToCalendar from '@/components/AddToCalendar';
import GuestbookForm from '@/components/GuestbookForm';
import GuestbookList from '@/components/GuestbookList';
import LiveGallery from '@/components/LiveGallery';

export default function Invitation({ event, messages = [], refParam }: { event: EventRow, messages?: GuestbookMessageRow[], refParam?: string }) {
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

  let defaultRing = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=400&auto=format&fit=crop";

  // Curation Intelligente : Choix des photos premium par défaut selon le type d'événement
  if (gallery.length === 0) {
    const titleLower = event.title.toLowerCase();
    
    if (titleLower.includes('bapt') || titleLower.includes('ngente') || titleLower.includes('naissance')) {
      // Thème Baptême / Naissance
      defaultRing = "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=400&auto=format&fit=crop"; // Chaussons bébé
      gallery = [
        "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2070&auto=format&fit=crop"
      ];
    } else if (titleLower.includes('gala') || titleLower.includes('anniversaire') || titleLower.includes('soirée') || titleLower.includes('diner')) {
      // Thème Soirée / Gala
      defaultRing = "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop"; // Coupe Champagne
      gallery = [
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop"
      ];
    } else {
      // Thème Mariage par défaut (Takk, Union, Wedding...)
      defaultRing = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=400&auto=format&fit=crop"; // Bague
      gallery = [
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop"
      ];
    }
  }

  // La première cérémonie sert pour le compte à rebours et l'ajout au calendrier
  const firstCeremony = event.ceremonies[0];

  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Language>('fr');
  
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
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-festara-gold animate-pulse">{DICTIONARY[lang].loading}</p>
        <h1 className="text-4xl font-serif mt-6 opacity-80">{event.title}</h1>
      </div>
    );
  }

  const dict = DICTIONARY[lang];

  return (
    <main className={`min-h-[120vh] relative overflow-hidden flex flex-col items-center py-8 sm:py-16 px-4 ${t.page}`}>
      
      {/* Sélecteur de Langue */}
      <div className="fixed top-6 sm:top-8 right-4 sm:right-8 z-50 flex items-center gap-2 bg-[#0A1226]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <button onClick={() => setLang('fr')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lang === 'fr' ? 'bg-festara-gold text-[#0A1226]' : 'text-white/60 hover:text-white'}`}>FR</button>
        <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-festara-gold text-[#0A1226]' : 'text-white/60 hover:text-white'}`}>EN</button>
        <button onClick={() => setLang('wo')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lang === 'wo' ? 'bg-festara-gold text-[#0A1226]' : 'text-white/60 hover:text-white'}`}>WO</button>
      </div>

      {/* Bouton Retour contextuel Premium */}
      {refParam === 'dashboard' && (
        <Link href={`/dashboard/${event.id}`} className="fixed top-6 sm:top-8 left-4 sm:left-8 z-50 group flex items-center gap-3 bg-[#0A1226]/80 hover:bg-[#0A1226] backdrop-blur-xl border border-white/10 text-white px-4 sm:px-5 py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(197,154,69,0.3)] hover:border-festara-gold/50 hover:-translate-y-1">
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-festara-gold group-hover:text-[#0A1226] transition-all duration-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </div>
          <span className="pr-1">{dict.backAccount}</span>
        </Link>
      )}
      {refParam === 'home' && (
        <Link href="/" className="fixed top-6 sm:top-8 left-4 sm:left-8 z-50 group flex items-center gap-3 bg-[#0A1226]/80 hover:bg-[#0A1226] backdrop-blur-xl border border-white/10 text-white px-4 sm:px-5 py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(197,154,69,0.3)] hover:border-festara-gold/50 hover:-translate-y-1">
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-festara-gold group-hover:text-[#0A1226] transition-all duration-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </div>
          <span className="pr-1">{dict.backHome}</span>
        </Link>
      )}

      {/* Ornements de fond luxueux et Immersif */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {gallery[0] && (
          <Image src={gallery[0]} alt="Fond immersif" fill className="object-cover opacity-30 sm:opacity-40 blur-[80px] sm:blur-[120px] scale-125 mix-blend-overlay" />
        )}
        <div className={`absolute inset-0 ${isDark ? 'bg-[#0A1226]/80' : 'bg-festara-sand/85'} backdrop-blur-2xl`}></div>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-festara-gold/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-festara-teal/10 blur-[100px]"></div>
      </div>

      <div className={`max-w-md w-full mx-auto rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden relative z-10 animate-fade-in-up shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-md ${isDark ? 'bg-white/5' : 'bg-white/60'} ${t.font}`}>
        
        {/* HÉROS : Galerie avec Montage Décoratif et Compte à rebours */}
        <div className="relative w-full overflow-hidden pb-8">
          {/* Decorative background elements */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-festara-gold/20 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 pt-16 pb-6 px-6 flex flex-col items-center">
             
             {/* Ring/Icon Photo Accent (Floating) */}
             <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] border-festara-gold shadow-[0_10px_30px_rgba(197,154,69,0.4)] z-20 mb-[-2.5rem] bg-white relative animate-float">
                <Image 
                  src={defaultRing} 
                  alt="Icône de l'événement" 
                  fill
                  sizes="96px"
                  className="object-cover"
                />
             </div>

             {/* Montage Photos */}
             {gallery.length === 1 ? (
               // One Image: Grand Arch
               <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-[4px] border-white/30 shadow-2xl relative group scale-95 sm:scale-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-festara-navy/60 to-transparent group-hover:opacity-0 transition-opacity duration-1000 z-10"></div>
                  <Image src={gallery[0]} alt={event.title} fill sizes="(max-width: 640px) 280px, 320px" className="object-cover group-hover:scale-[1.05] transition-transform duration-1000" priority />
               </div>
             ) : (
               // Multiple Images: Staggered Elegant Layout
               <div className="relative w-full h-[440px] sm:h-[500px] max-w-[340px] mx-auto mt-4 scale-95 sm:scale-100">
                  {/* Image 1 (Back left) */}
                  <div className="absolute top-0 left-0 w-[65%] aspect-[3/4] rounded-[2rem] overflow-hidden border-[3px] border-white/40 shadow-2xl transform -rotate-6 hover:rotate-0 hover:z-40 transition-all duration-700 origin-bottom-left group">
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>
                     <Image src={gallery[0]} alt="" fill sizes="220px" className="object-cover group-hover:scale-110 transition-transform duration-1000" priority />
                  </div>
                  {/* Image 2 (Front right) */}
                  <div className="absolute top-16 right-0 w-[65%] aspect-[3/4] rounded-[2rem] overflow-hidden border-[3px] border-white/40 shadow-2xl transform rotate-6 hover:rotate-0 hover:z-40 transition-all duration-700 origin-bottom-right z-20 group">
                     <Image src={gallery[1]} alt="" fill sizes="220px" className="object-cover group-hover:scale-110 transition-transform duration-1000" priority />
                  </div>
                  {/* Image 3 (Bottom center accent) */}
                  {gallery[2] && (
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[60%] aspect-[4/3] rounded-[1.5rem] overflow-hidden border-[3px] border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transform hover:scale-105 hover:-translate-y-4 hover:z-50 transition-all duration-700 z-30 group">
                        <Image src={gallery[2]} alt="" fill sizes="200px" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
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
          <p className={`uppercase tracking-[0.35em] text-xs font-bold mb-4 opacity-80 ${t.accent}`}>
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

          {/* Cérémonies - Style Billet VIP Premium */}
          <div className="space-y-8 text-left relative before:absolute before:inset-0 before:ml-6 md:before:mx-auto before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-festara-gold/30 before:to-transparent">
            {event.ceremonies.map((c, idx) => (
              <div
                key={c.id}
                className={`relative rounded-[2rem] p-8 overflow-hidden border transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_50px_-15px_rgba(197,154,69,0.3)] group ${isDark ? 'bg-white/10 border-white/20 backdrop-blur-lg' : 'bg-white/80 border-black/10 shadow-xl backdrop-blur-lg'}`}
              >
                {/* Glow au survol */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-festara-gold/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000 pointer-events-none"></div>

                {/* Ligne pointillée effet ticket or */}
                <div className="absolute left-6 top-0 bottom-0 w-px border-l-2 border-dashed border-festara-gold/30"></div>
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 rounded-r-full border border-l-0 ${isDark ? 'bg-[#0A1226] border-white/20' : 'bg-festara-sand border-black/10'}`}></div>
                
                <div className="pl-6 relative z-10">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${isDark ? 'bg-festara-gold/20 text-festara-gold border border-festara-gold/30' : 'bg-festara-gold/10 text-festara-navy border border-festara-gold/20'}`}>
                    {dict.step} {idx + 1}
                  </span>
                  <h2 className={`text-2xl sm:text-3xl mb-2 ${t.title}`}>{c.name}</h2>
                  <p className={`text-sm font-bold tracking-wide ${isDark ? 'text-festara-gold' : 'text-festara-gold'}`}>
                    {formatDateFr(c.date)}
                    {c.time ? ` · ${c.time}` : ''}
                  </p>
                  <p className={`text-sm mt-3 mb-6 opacity-90 font-medium ${isDark ? 'text-white/80' : 'text-festara-ink/80'}`}>{c.location}</p>
                  
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner relative group-hover:shadow-[0_0_20px_rgba(197,154,69,0.2)] transition-shadow duration-500">
                    <iframe
                      title={`Carte ${c.name}`}
                      src={mapsEmbedUrl(c)}
                      className="w-full h-36 border-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 my-12 opacity-50">
            <div className={`h-px w-16 ${isDark ? 'bg-white' : 'bg-black'}`}></div>
            <p className={`text-sm ${t.accent}`}>⚜</p>
            <div className={`h-px w-16 ${isDark ? 'bg-white' : 'bg-black'}`}></div>
          </div>

          {/* SECTION RSVP */}
          <div className={`px-6 sm:px-12 py-10 sm:py-16 ${isDark ? 'bg-white/5' : 'bg-white/40'} border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            <div className="text-center mb-8">
              <span className="w-12 h-1 bg-festara-gold mx-auto block mb-6 rounded-full"></span>
              <h2 className={`text-3xl sm:text-4xl font-serif font-bold ${t.title}`}>{dict.rsvpTitle}</h2>
              <p className={`mt-3 text-sm font-medium ${isDark ? 'text-white/60' : 'text-festara-ink/70'}`}>
                {dict.rsvpSubtitle}
              </p>
            </div>
            <RsvpForm eventId={event.id} ceremonies={event.ceremonies} dark={isDark} dict={dict} />
          </div>

          {/* Livre d'Or (Guestbook) */}
          <div className="mt-16 pt-16 border-t border-current opacity-90 text-center relative z-30">
            <h3 className={`text-4xl mb-4 ${t.title}`}>{dict.guestbookTitle}</h3>
            <p className={`text-sm mb-10 opacity-80 ${t.font}`}>{dict.guestbookSubtitle}</p>
            
            <div className="mb-12">
              <GuestbookForm eventId={event.id} isDark={isDark} dict={dict} />
            </div>

            {messages.length > 0 && (
              <div className="mt-8 relative z-30">
                <GuestbookList messages={messages} isDark={isDark} />
              </div>
            )}
            
            {/* GALERIE LIVE */}
            <div className={`mt-20 border-t ${isDark ? 'border-white/10' : 'border-black/5'} pt-12`}>
              <LiveGallery eventId={event.id} isDark={isDark} dict={dict} />
            </div>
          </div>

          {/* CTA Festara Marketing */}
          <div className="mt-16 pt-10 border-t border-current opacity-90 text-center pb-4">
            <p className={`text-sm mb-5 font-medium opacity-80`}>Votre histoire mérite aussi d'être célébrée.</p>
            <a href="/" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-2xl ${isDark ? 'bg-gradient-to-r from-[#C59A45] to-[#DFB769] text-white hover:shadow-[#C59A45]/30' : 'bg-gradient-to-r from-festara-navy to-[#1A2A4A] text-white hover:shadow-festara-navy/30'}`}>
              Créer mon faire-part <span className="text-lg leading-none">✨</span>
            </a>
            <p className="text-xs uppercase tracking-[0.4em] font-bold mt-12 opacity-20">
              Festara • Yëgël
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
