'use client';

import { useState } from 'react';

const PLANS = [
  { key: 'essentiel', label: 'Essentiel', price: '15 000 FCFA', desc: '200 invités, 3 templates, Pass' },
  { key: 'premium', label: 'Premium', price: '25 000 FCFA', desc: 'Invités illimités, scan hôte' },
];

export default function PayButton({ eventId, currentPlan }: { eventId: string; currentPlan: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pay(plan: string, provider: 'paydunya' | 'stripe') {
    setError(null);
    setLoading(`${plan}-${provider}`);
    try {
      const res = await fetch(`/api/pay/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, plan }),
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
              onClick={() => pay(p.key, 'paydunya')}
              disabled={!!loading}
              className="btn-primary w-full mt-3"
            >
              {loading === `${p.key}-paydunya` ? 'Redirection…' : 'Wave / Orange Money'}
            </button>
            <button
              onClick={() => pay(p.key, 'stripe')}
              disabled={!!loading}
              className="btn-outline w-full mt-2"
            >
              {loading === `${p.key}-stripe` ? 'Redirection…' : 'Carte (diaspora)'}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-festara-ink/40">
        Wave / Orange Money via PayDunya (FCFA) · Carte EUR via Stripe (diaspora).
      </p>
    </div>
  );
}
