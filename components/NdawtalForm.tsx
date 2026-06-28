'use client';

import { useState } from 'react';

export default function NdawtalForm({ eventId, isDark }: { eventId: string; isDark: boolean }) {
  const [amount, setAmount] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [5000, 10000, 20000];

  const inputClass =
    'w-full rounded-2xl px-4 text-sm border focus:ring-2 focus:outline-none transition-all ' +
    (isDark
      ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-white/50 focus:bg-white/20'
      : 'bg-white/60 border-black/10 text-festara-navy placeholder-festara-ink/40 focus:ring-[#C59A45]/50 focus:bg-white');

  const labelClass = 'block text-[10px] font-bold uppercase tracking-widest ml-1 mb-1.5 ' + (isDark ? 'text-white/80' : 'text-festara-navy');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!amount || amount < 1000) return setError('Le montant minimum est de 1 000 FCFA.');
    if (!name.trim()) return setError('Votre nom est requis.');

    setLoading(true);
    try {
      const res = await fetch('/api/pay/ndawtal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, amount, author_name: name, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d\'initialisation du paiement.');
      
      // Redirection vers PayDunya
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Lien de paiement manquant.');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-festara-teal via-festara-gold to-festara-teal"></div>
      
      <div className="text-center mb-6">
        <span className="text-3xl mb-2 block">🎁</span>
        <h4 className={`text-2xl font-serif font-bold ${isDark ? 'text-white' : 'text-festara-navy'}`}>Offrir un cadeau</h4>
        <p className={`text-xs mt-2 font-medium ${isDark ? 'text-white/60' : 'text-festara-ink/60'}`}>
          Participez à la cagnotte par Wave ou Orange Money
        </p>
      </div>

      <form onSubmit={submit} className="text-left space-y-6">
        <div>
          <label className={labelClass}>Montant (FCFA)</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p)}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                  amount === p
                    ? 'bg-festara-gold text-white border-festara-gold'
                    : isDark
                    ? 'border-white/20 text-white hover:bg-white/10'
                    : 'border-black/10 text-festara-navy hover:bg-black/5'
                }`}
              >
                {p.toLocaleString('fr-FR')} F
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1000}
            step={500}
            className={`${inputClass} min-h-[48px] text-lg font-mono font-bold text-center`}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || '')}
            placeholder="Autre montant..."
          />
        </div>

        <div>
          <label className={labelClass}>De la part de (Prénom / Nom)</label>
          <input
            type="text"
            maxLength={50}
            className={`${inputClass} min-h-[48px]`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Famille Ndiaye"
          />
        </div>

        <div>
          <label className={labelClass}>Un petit mot pour les mariés (Optionnel)</label>
          <textarea
            className={`${inputClass} py-3 resize-none h-20`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Félicitations pour..."
            maxLength={200}
          />
        </div>

        {error && <p className="text-xs text-red-500 text-center font-bold">{error}</p>}

        <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 shadow-xl bg-[#0070BA] text-white hover:bg-[#005ea6] flex items-center justify-center gap-3">
          {loading ? 'Redirection...' : 'Offrir ce cadeau 💳'}
        </button>
        <p className="text-[9px] text-center uppercase tracking-widest opacity-50 mt-3 font-bold">Sécurisé par PayDunya</p>
      </form>
    </div>
  );
}
