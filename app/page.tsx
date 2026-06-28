import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-festara-sand font-sans selection:bg-festara-gold/30">
      
      {/* 
        ========================================================================
        HERO SECTION (DARK MODE) 
        ========================================================================
      */}
      <section className="relative overflow-hidden bg-[#0A1226] text-white pt-32 pb-40 lg:pt-40 lg:pb-56 rounded-b-[3rem] lg:rounded-b-[5rem] shadow-2xl z-20">
        
        {/* Abstract Lighting Effects */}
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-festara-gold/10 blur-[120px] pointer-events-none animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-festara-teal/15 blur-[120px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Left Text Block */}
          <div className="flex-1 text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-festara-gold/30 bg-festara-gold/5 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(197,154,69,0.2)]">
              <span className="w-2 h-2 rounded-full bg-festara-gold animate-pulse"></span>
              <span className="text-festara-gold font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs">
                Le nouveau standard événementiel
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-bold leading-[1.1] font-serif mb-8 tracking-tight">
              L'art de l'invitation <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DFB769] to-[#C59A45] italic pr-2">
                digitale.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-10">
              Transformez l'expérience de vos invités. RSVPs instantanés, contrôle d'accès sécurisé par QR Code, et envois WhatsApp automatisés. La plateforme de gestion d'événements la plus élégante du Sénégal.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-festara-gold hover:bg-[#DFB769] text-white font-bold rounded-xl shadow-[0_0_30px_rgba(197,154,69,0.3)] hover:shadow-[0_0_40px_rgba(197,154,69,0.5)] transition-all hover:-translate-y-1 text-center">
                Créer un événement
              </Link>
              <Link href="/i/demo" className="w-full sm:w-auto px-8 py-4 border-2 border-white/10 hover:border-white/30 hover:bg-white/5 text-white font-bold rounded-xl transition-all text-center flex items-center justify-center gap-2">
                Voir une démo ↗
              </Link>
            </div>
          </div>

          {/* Right Visual Block (Floating VIP Pass) */}
          <div className="flex-1 w-full max-w-md lg:max-w-none relative perspective-1000 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
             <div className="relative w-full aspect-[4/5] max-w-[320px] mx-auto transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-all duration-700 ease-out group">
                
                {/* Deep Glow Behind */}
                <div className="absolute inset-0 bg-gradient-to-tr from-festara-gold/40 to-festara-teal/20 blur-[50px] rounded-[2.5rem] group-hover:blur-[70px] transition-all duration-700"></div>
                
                {/* The Ticket / Pass */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B1528] via-[#0A1226] to-[#120F08] border-[1.5px] border-festara-gold/40 rounded-[2.5rem] shadow-2xl flex flex-col justify-between overflow-hidden">
                   
                   {/* Golden Shine Overlay (Animated on hover) */}
                   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out pointer-events-none"></div>

                   {/* Background Ornaments (Subtle pattern) */}
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-festara-gold/30 via-transparent to-transparent pointer-events-none"></div>

                   {/* Pass Header */}
                   <div className="pt-8 px-6 text-center relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DFB769] to-[#C59A45] flex items-center justify-center text-xl shadow-[0_0_20px_rgba(197,154,69,0.4)] mb-3 border border-white/20">
                        👑
                      </div>
                      <p className="text-festara-gold/70 text-[9px] uppercase tracking-[0.3em] font-bold mb-1">Pass VIP Exclusif</p>
                      <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Aïda & Modou</h2>
                   </div>

                   {/* Mock QR with Luxury Frame */}
                   <div className="relative mx-auto my-6 w-44 h-44 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 z-10">
                     {/* Golden Frame Corners */}
                     <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-festara-gold rounded-tl-lg"></div>
                     <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-festara-gold rounded-tr-lg"></div>
                     <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-festara-gold rounded-bl-lg"></div>
                     <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-festara-gold rounded-br-lg"></div>
                     
                     <div className="bg-white p-3 rounded-2xl w-36 h-36 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <div className="w-full h-full bg-festara-navy rounded-xl opacity-15 relative">
                           {/* Faux pattern QR */}
                           <div className="absolute top-1.5 left-1.5 w-8 h-8 border-[3px] border-festara-navy rounded-md"></div>
                           <div className="absolute top-1.5 right-1.5 w-8 h-8 border-[3px] border-festara-navy rounded-md"></div>
                           <div className="absolute bottom-1.5 left-1.5 w-8 h-8 border-[3px] border-festara-navy rounded-md"></div>
                        </div>
                     </div>
                   </div>

                   {/* Divider */}
                   <div className="w-full border-t border-dashed border-festara-gold/30 relative z-10">
                      {/* Ticket Notches */}
                      <div className="absolute -left-3 -top-3 w-6 h-6 bg-[#0A1226] rounded-full border-r border-festara-gold/40"></div>
                      <div className="absolute -right-3 -top-3 w-6 h-6 bg-[#0A1226] rounded-full border-l border-festara-gold/40"></div>
                   </div>

                   {/* Pass Footer */}
                   <div className="p-6 text-center relative z-10 bg-gradient-to-t from-festara-gold/10 to-transparent">
                      <h3 className="text-lg font-bold text-white mb-1">Mme Fatou Diop</h3>
                      <div className="flex items-center justify-center gap-2 text-xs font-medium text-white/60">
                         <span>Table d'Honneur</span>
                         <span className="text-[8px] text-festara-gold">💎</span>
                         <span>2 Personnes</span>
                      </div>
                   </div>

                </div>
             </div>
          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        BENTO GRID SECTION (SAND MODE)
        ========================================================================
      */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40">
        
        <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-3xl md:text-5xl font-bold text-festara-navy font-serif mb-4">L'excellence dans chaque détail.</h2>
          <p className="text-festara-ink/60 font-medium max-w-2xl mx-auto">Une suite complète d'outils conçue pour vous libérer des contraintes logistiques et sublimer l'expérience de vos invités.</p>
        </div>

        {/* The Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Card 1: RSVP (Large Horizontal) */}
          <div className="md:col-span-2 glass bg-white/70 hover:bg-white border border-black/5 rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group transition-all duration-500 hover:shadow-xl">
             <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-festara-teal/10 rounded-full blur-3xl group-hover:bg-festara-teal/20 transition-colors"></div>
             <div className="relative z-10 max-w-sm">
               <div className="w-14 h-14 rounded-2xl bg-festara-teal/10 text-festara-teal flex items-center justify-center text-2xl mb-6 shadow-sm">✨</div>
               <h3 className="text-2xl font-bold font-serif text-festara-navy mb-3">Réponses instantanées</h3>
               <p className="text-festara-ink/70 leading-relaxed font-medium">Vos invités confirment leur présence en un clic depuis un lien élégant. Fini les appels interminables pour savoir qui vient avec qui.</p>
             </div>
          </div>

          {/* Card 2: Sécurité (Tall Vertical) */}
          <div className="md:col-span-1 md:row-span-2 glass bg-[#0A1226] border border-[#0A1226] text-white rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group transition-all duration-500 hover:shadow-2xl">
             <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-festara-gold/0 to-festara-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-festara-gold/20 text-festara-gold flex items-center justify-center text-2xl mb-6 shadow-sm border border-festara-gold/30">🎫</div>
               <h3 className="text-2xl font-bold font-serif mb-3">Contrôle absolu</h3>
               <p className="text-white/60 leading-relaxed font-medium">Chaque invité reçoit un QR Code unique et infalsifiable. À l'entrée, votre équipe de sécurité le scanne en une seconde avec notre scanner intégré.</p>
             </div>
             <div className="relative z-10 w-full aspect-square border-2 border-dashed border-white/20 rounded-3xl mt-8 flex items-center justify-center group-hover:border-festara-gold/50 transition-colors">
                <span className="text-4xl animate-bounce">📷</span>
             </div>
          </div>

          {/* Card 3: WhatsApp (Square) */}
          <div className="md:col-span-1 glass bg-white/70 hover:bg-white border border-black/5 rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group transition-all duration-500 hover:shadow-xl">
             <div className="relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center text-2xl mb-6 shadow-sm">📱</div>
               <h3 className="text-2xl font-bold font-serif text-festara-navy mb-3">Envois WhatsApp</h3>
               <p className="text-festara-ink/70 leading-relaxed font-medium">Importez votre liste d'invités et envoyez leurs Pass VIP sécurisés d'un simple clic via WhatsApp.</p>
             </div>
          </div>

          {/* Card 4: Analytics (Square) */}
          <div className="md:col-span-1 glass bg-white/70 hover:bg-white border border-black/5 rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group transition-all duration-500 hover:shadow-xl">
             <div className="relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-festara-gold/10 text-festara-gold flex items-center justify-center text-2xl mb-6 shadow-sm">📊</div>
               <h3 className="text-2xl font-bold font-serif text-festara-navy mb-3">Suivi en temps réel</h3>
               <p className="text-festara-ink/70 leading-relaxed font-medium">Un tableau de bord complet pour exporter vos listes et suivre les statistiques d'entrées en direct le jour J.</p>
             </div>
          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        FOOTER
        ========================================================================
      */}
      <footer className="bg-white border-t border-black/5 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-festara-gold"></span>
          <span className="font-bold uppercase tracking-widest text-[10px] text-festara-gold">Festara</span>
        </div>
        <p className="text-xs text-festara-ink/40 font-bold uppercase tracking-widest">
          Conçu pour l'élégance. © {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
