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
      <div className="grid sm:grid-cols-2 gap-3">
        {PLANS.map((p) => (
          <div key={p.key} className="rounded-xl border border-black/10 p-4">
            <p className="font-bold text-festara-navy">{p.label}</p>
            <p className="text-festara-gold font-semibold">{p.price}</p>
            <p className="mt-1 text-xs text-festara-ink/60">{p.desc}</p>
            <button
              onClick={() => pay(p.key, 'naboopay')}
              disabled={!!loading}
              className="btn-primary w-full mt-3"
            >
              {loading === `${p.key}-naboopay` ? 'Redirection…' : 'Wave / Orange Money'}
            </button>
            <button
              onClick={() => pay(p.key, 'stripe')}
              disabled={!!loading}
              className="btn-outline w-full mt-2"
            >
              {loading === `${p.key}-stripe` ? 'Redirection…' : 'Carte (diaspora)'}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                className="w-full text-center text-sm text-gray-500 hover:text-festara-navy mt-4 transition-colors font-semibold"
                onClick={async () => {
                  try {
                    const { forceUpgradeEventAction } = await import('@/app/dashboard/agencies/actions');
                    await forceUpgradeEventAction(eventId, p.key);
                    window.location.reload();
                  } catch (e: any) {
                    alert(e.message);
                  }
                }}
              >
                🛠️ Bypass Local (Dev)
              </button>
            )}
          </div>
        ))}
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
