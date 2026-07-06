'use client';

import { useState } from 'react';
import { PLANS } from '@/lib/paydunya';

export default function AgencyPayButton({ organizationId, currentPlan }: { organizationId: string; currentPlan: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const agencyPlan = PLANS['agence'];

  async function pay(provider: 'paydunya' | 'stripe') {
    setError(null);
    setLoading(provider);
    try {
      const res = await fetch(`/api/pay/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: organizationId, plan: 'agence' }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Paiement indisponible.');
      window.location.href = data.url; // redirection vers la passerelle
    } catch (e: any) {
      setError(e.message);
      setLoading(null);
    }
  }

  if (currentPlan === 'agency' || currentPlan === 'pro') {
    return (
      <div className="rounded-xl border border-green-600/30 bg-green-600/10 p-4 text-sm text-green-700">
        Votre agence est actuellement sur le plan : <strong>{currentPlan.toUpperCase()}</strong> ✅<br/>
        Vous bénéficiez des fonctionnalités Premium pour <strong>jusqu'à 25 événements</strong> !
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-festara-sand/30 p-6 rounded-2xl border border-festara-gold/30">
      <div>
        <h3 className="font-bold text-festara-navy text-xl">Devenir Agence Pro 👑</h3>
        <p className="text-sm text-festara-navy/70 mt-1">
          Débloquez les fonctionnalités Premium (invités illimités, personnalisation, scan par l'hôte) pour un pack de <strong>25 événements</strong>.
        </p>
      </div>
      
      <div className="bg-white rounded-xl border border-black/5 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <p className="font-bold text-festara-navy">{agencyPlan?.label || 'Festara Agence Pro'}</p>
          <p className="text-festara-gold font-bold text-2xl">
            {agencyPlan?.amount ? `${(agencyPlan.amount).toLocaleString('fr-FR')} FCFA` : '100 000 FCFA'}
          </p>
          <p className="text-xs text-festara-ink/60">Paiement unique / Pack de 25 événements</p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col gap-2 min-w-[200px]">
          <button
            onClick={() => pay('paydunya')}
            disabled={!!loading}
            className="btn-primary w-full"
          >
            {loading === 'paydunya' ? 'Redirection…' : 'Wave / Orange Money'}
          </button>
          <button
            onClick={() => pay('stripe')}
            disabled={!!loading}
            className="btn-outline w-full"
          >
            {loading === 'stripe' ? 'Redirection…' : 'Carte (diaspora)'}
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={async () => {
                setLoading('bypass');
                const { forceUpgradeAction } = await import('@/app/dashboard/agencies/actions');
                await forceUpgradeAction(organizationId);
                window.location.reload();
              }}
              disabled={!!loading}
              className="btn-outline w-full border-red-500 text-red-500 hover:bg-red-50"
            >
              {loading === 'bypass' ? 'Validation...' : '🛠️ Bypass Local (Dev)'}
            </button>
          )}
        </div>
      </div>
      
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
