'use client';

import { useState } from 'react';

const PLANS = [
  { key: 'essentiel', label: 'Plan Essentiel', price: '15 000 FCFA', desc: 'Jusqu\'à 200 invités, RSVP, Galerie collaborative' },
  { key: 'premium', label: 'Plan Premium', price: '25 000 FCFA', desc: 'Invités illimités, Relances WhatsApp, Scan VIP Hôtesse' },
];

export default function PayButton({ eventId, currentPlan }: { eventId: string; currentPlan: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');

  async function pay(plan: string, provider: 'naboopay' | 'stripe') {
    setError(null);
    setLoading(`${plan}-${provider}`);
    try {
      const res = await fetch(`/api/pay/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, plan, promoCode: promoCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Paiement indisponible.');
      window.location.href = data.url; // redirection vers la passerelle
    } catch (e: any) {
      setError(e.message);
      setLoading(null);
    }
  }

  if (currentPlan && currentPlan !== 'gratuit') {
    return (
      <div className="rounded-xl border border-green-600/30 bg-green-600/10 p-4 text-sm text-green-700">
        Plan actif : <strong>{currentPlan}</strong> ✅
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-festara-navy">Activer un plan payant</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Essentiel */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/5 shadow-xl shadow-black/5 flex flex-col relative overflow-hidden">
          <h3 className="text-xl font-bold text-festara-navy mb-2">Plan Essentiel</h3>
          <div className="text-3xl font-bold font-serif text-festara-navy mb-2">15 000 <span className="text-lg text-festara-gold">FCFA</span></div>
          <p className="text-xs text-festara-navy/60 mb-6 font-medium">Par événement. Idéal pour les dîners et réceptions intimes.</p>
          
          <ul className="space-y-3 mb-8 flex-1 text-sm">
            <li className="flex items-center gap-3 text-festara-navy/80 font-medium"><span className="text-festara-gold">✓</span> Jusqu'à 200 invités</li>
            <li className="flex items-center gap-3 text-festara-navy/80 font-medium"><span className="text-festara-gold">✓</span> Site web personnalisé</li>
            <li className="flex items-center gap-3 text-festara-navy/80 font-medium"><span className="text-festara-gold">✓</span> Gestion des RSVPs</li>
            <li className="flex items-center gap-3 text-festara-navy/80 font-medium"><span className="text-festara-gold">✓</span> Galerie photos collaborative</li>
          </ul>
          
          <div className="space-y-2 mt-auto">
            <button
              onClick={() => pay('essentiel', 'naboopay')}
              disabled={!!loading}
              className="w-full text-center py-3 bg-festara-navy hover:bg-festara-navy/90 text-white font-bold rounded-xl transition-colors text-sm"
            >
              {loading === 'essentiel-naboopay' ? 'Redirection…' : 'Wave / Orange Money'}
            </button>
            <button
              onClick={() => pay('essentiel', 'stripe')}
              disabled={!!loading}
              className="w-full text-center py-3 bg-festara-navy/5 hover:bg-festara-navy/10 text-festara-navy font-bold rounded-xl transition-colors text-sm"
            >
              {loading === 'essentiel-stripe' ? 'Redirection…' : 'Carte (diaspora)'}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                className="w-full text-center text-xs text-gray-400 hover:text-festara-navy mt-2 transition-colors font-semibold"
                onClick={async () => {
                  try {
                    const { forceUpgradeEventAction } = await import('@/app/dashboard/agencies/actions');
                    await forceUpgradeEventAction(eventId, 'essentiel');
                    window.location.reload();
                  } catch (e: any) { alert(e.message); }
                }}
              >
                🛠️ Bypass Local (Dev)
              </button>
            )}
          </div>
        </div>

        {/* Premium */}
        <div className="bg-[#0A1226] rounded-3xl p-6 md:p-8 border border-festara-gold/30 shadow-2xl shadow-festara-gold/10 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-festara-gold/20 rounded-full blur-2xl"></div>
          
          <div className="inline-flex self-start px-3 py-1 rounded-full bg-festara-gold text-[#0A1226] text-[10px] font-bold uppercase tracking-widest mb-4">
            Le plus choisi
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Plan Premium</h3>
          <div className="text-3xl font-bold font-serif text-white mb-2">25 000 <span className="text-lg text-festara-gold">FCFA</span></div>
          <p className="text-xs text-white/60 mb-6 font-medium">L'expérience VIP ultime pour les grands mariages.</p>
          
          <ul className="space-y-3 mb-8 flex-1 text-sm">
            <li className="flex items-center gap-3 text-white/90 font-medium"><span className="text-festara-gold">✨</span> <strong>Invités illimités</strong></li>
            <li className="flex items-center gap-3 text-white/90 font-medium"><span className="text-festara-gold">✨</span> <strong>Envois massifs WhatsApp</strong></li>
            <li className="flex items-center gap-3 text-white/90 font-medium"><span className="text-festara-gold">✨</span> <strong>Génération de Pass QR Code</strong></li>
            <li className="flex items-center gap-3 text-white/90 font-medium"><span className="text-festara-gold">✨</span> <strong>Application Scanner pour hôtesses</strong></li>
            <li className="flex items-center gap-3 text-white/90 font-medium"><span className="text-festara-gold">✨</span> Statistiques en direct</li>
          </ul>
          
          <div className="space-y-2 mt-auto">
            <button
              onClick={() => pay('premium', 'naboopay')}
              disabled={!!loading}
              className="w-full text-center py-3 bg-gradient-to-r from-festara-gold to-[#DFB769] hover:from-[#DFB769] hover:to-festara-gold text-[#0A1226] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(197,154,69,0.3)] text-sm"
            >
              {loading === 'premium-naboopay' ? 'Redirection…' : 'Wave / Orange Money'}
            </button>
            <button
              onClick={() => pay('premium', 'stripe')}
              disabled={!!loading}
              className="w-full text-center py-3 border border-festara-gold/30 hover:bg-festara-gold/10 text-festara-gold font-bold rounded-xl transition-colors text-sm"
            >
              {loading === 'premium-stripe' ? 'Redirection…' : 'Carte (diaspora)'}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                className="w-full text-center text-xs text-white/40 hover:text-festara-gold mt-2 transition-colors font-semibold"
                onClick={async () => {
                  try {
                    const { forceUpgradeEventAction } = await import('@/app/dashboard/agencies/actions');
                    await forceUpgradeEventAction(eventId, 'premium');
                    window.location.reload();
                  } catch (e: any) { alert(e.message); }
                }}
              >
                🛠️ Bypass Local (Dev)
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-2">
        <label className="block text-xs font-bold text-festara-navy/60 uppercase tracking-widest ml-1 mb-2">Code Promo (Optionnel)</label>
        <input 
          type="text" 
          value={promoCode} 
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="Ex: LANCEMENT20" 
          className="w-full sm:w-1/2 rounded-xl px-4 py-2 text-sm border border-black/10 bg-white focus:bg-white focus:border-festara-gold/50 focus:ring-2 focus:ring-festara-gold/10 outline-none transition-all placeholder:text-[#0A1226]/30 font-bold text-festara-navy"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-festara-ink/40">
        Wave / Orange Money via NabooPay (FCFA) · Carte EUR via Stripe (diaspora).
      </p>
    </div>
  );
}
