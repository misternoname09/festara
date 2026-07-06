'use client';

import { useState } from 'react';
import type { Ceremony } from '@/lib/types';

interface Props {
  eventId: string;
  ceremonies: Ceremony[];
  dark?: boolean;
}

type Result = { pass_uuid: string; pass_code: string };

export default function RsvpForm({ eventId, ceremonies, dark }: Props) {
  const [firstName, setFirstName] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [selected, setSelected] = useState<string[]>(ceremonies.map((c) => c.id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const inputClass =
    'w-full rounded-2xl px-4 min-h-[56px] text-base border focus:ring-2 focus:outline-none transition-all ' +
    (dark
      ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-white/50 focus:bg-white/20'
      : 'bg-white/60 border-black/10 text-festara-navy placeholder-festara-ink/40 focus:ring-[#C59A45]/50 focus:bg-white');

  const labelClass = 'block text-xs font-semibold uppercase tracking-wider ml-1 mb-1.5 ' + (dark ? 'text-white/80' : 'text-festara-navy');

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim()) return setError('Indique ton prénom.');
    setLoading(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          first_name: firstName.trim(),
          party_size: partySize,
          ceremonies_attending: selected,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur, réessaie.');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const passUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/pass/${result.pass_uuid}`
        : `/pass/${result.pass_uuid}`;
    const waText = encodeURIComponent(
      `Voici mon Pass Festara pour l'événement. Code : ${result.pass_code}\n${passUrl}`
    );
    return (
      <div className={`rounded-3xl p-6 text-center animate-fade-in-up border ${dark ? 'bg-white/10 border-white/20 text-white' : 'bg-[#0A1226] border-[#C59A45]/30 text-white'}`}>
        <p className="text-4xl mb-3">✅</p>
        <p className="font-serif text-xl font-bold mb-1">Présence confirmée</p>
        <p className="text-xs text-festara-gold mb-3 font-bold uppercase tracking-widest">Vos informations ont bien été transmises aux mariés.</p>
        <p className="text-sm opacity-80 mb-6">
          Ton Pass est prêt. Code : <strong className="font-mono tracking-widest bg-white/20 px-2 py-1 rounded ml-1">{result.pass_code}</strong>
        </p>
        <a href={passUrl} className="btn w-full bg-[#C59A45] text-white hover:bg-[#DFB769] hover:-translate-y-0.5 shadow-lg mb-3">
          Voir mon Pass VIP
        </a>
        <a
          href={`https://wa.me/?text=${waText}`}
          className="btn w-full border border-white/20 hover:bg-white/10"
          target="_blank"
          rel="noreferrer"
        >
          Envoyer sur WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="text-left space-y-6">
      <p className={`font-serif text-2xl text-center mb-6 ${dark ? 'text-[#DFB769]' : 'text-[#0A1226]'}`}>Confirmer ma présence</p>

      <div>
        <label className={labelClass}>Ton prénom</label>
        <input
          className={inputClass}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Ex : Fatou"
        />
      </div>

      <div>
        <label className={labelClass}>Nombre de personnes (toi inclus)</label>
        <div className={`mt-2 flex items-center justify-between p-2 rounded-2xl border transition-all ${dark ? 'bg-white/5 border-white/20 text-white hover:border-white/40' : 'bg-white/60 border-black/10 text-festara-navy hover:border-[#C59A45]/50'}`}>
          <button 
            type="button" 
            onClick={() => setPartySize(Math.max(1, partySize - 1))}
            className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl font-light transition-all active:scale-95 ${dark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-festara-navy'}`}
            aria-label="Diminuer"
          >
            −
          </button>
          
          <div className="flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold font-serif leading-none mb-1">{partySize}</span>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${dark ? 'text-festara-gold' : 'text-festara-teal'}`}>
              {partySize === 1 ? 'Je viens seul(e)' : `Moi + ${partySize - 1} ${partySize === 2 ? 'accompagnant' : 'accompagnants'}`}
            </span>
          </div>

          <button 
            type="button" 
            onClick={() => setPartySize(Math.min(20, partySize + 1))}
            className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl font-light transition-all active:scale-95 ${dark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-festara-navy'}`}
            aria-label="Augmenter"
          >
            +
          </button>
        </div>
      </div>

      {ceremonies.length > 1 && (
        <div>
          <label className={labelClass}>Cérémonies où tu viens</label>
          <div className="mt-3 space-y-3">
            {ceremonies.map((c) => (
              <label key={c.id} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors border ${dark ? 'border-white/10 hover:bg-white/5' : 'border-black/5 hover:bg-white/50'}`}>
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={selected.includes(c.id)}
                    onChange={() => toggle(c.id)}
                  />
                  <div className={`w-6 h-6 rounded border-2 transition-colors flex items-center justify-center ${dark ? 'border-white/50 peer-checked:bg-[#C59A45] peer-checked:border-[#C59A45]' : 'border-festara-navy/30 peer-checked:bg-festara-navy peer-checked:border-festara-navy'}`}>
                    <svg className={`w-3 h-3 text-white transition-opacity ${selected.includes(c.id) ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className={`font-medium ${dark ? 'text-white' : 'text-festara-navy'}`}>{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-center">{error}</p>}

      <button type="submit" disabled={loading} className={`relative w-full mt-6 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-1 overflow-hidden shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 ${dark ? 'bg-gradient-to-r from-[#C59A45] to-[#DFB769] text-white' : 'bg-gradient-to-r from-festara-navy to-[#1A2A4A] text-white'}`}>
        <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></span>
        {loading ? 'Envoi en cours...' : (
          <>
            Je confirme ma présence <span className="text-xl leading-none">✨</span>
          </>
        )}
      </button>
    </form>
  );
}
