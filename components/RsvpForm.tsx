'use client';

import { useState } from 'react';
import type { Ceremony } from '@/lib/types';

interface Props {
  eventId: string;
  ceremonies: Ceremony[];
  dark?: boolean;
  dict: any;
}

type Result = { pass_uuid: string; pass_code: string };

export default function RsvpForm({ eventId, ceremonies, dark, dict }: Props) {
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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
          phone: phoneNumber.trim() || null,
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
      <p className={`font-serif text-2xl text-center mb-6 ${dark ? 'text-[#DFB769]' : 'text-[#0A1226]'}`}>{dict.rsvpTitle}</p>

      <div className="space-y-5">
        <div>
          <label className={labelClass}>{dict.nameLabel}</label>
          <input
            type="text"
            required
            placeholder={dict.namePlaceholder}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>{dict.phoneLabel}</label>
          <input
            type="tel"
            placeholder={dict.phonePlaceholder}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>{dict.partyLabel}</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="5"
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value))}
              className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${dark ? 'bg-white/20 accent-festara-gold' : 'bg-black/10 accent-festara-navy'}`}
            />
            <span className={`text-xl font-bold font-serif w-12 text-center ${dark ? 'text-festara-gold' : 'text-festara-gold'}`}>
              {partySize}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <label className={labelClass + ' mb-3 block'}>{dict.ceremoniesLabel}</label>
        <div className="space-y-3">
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

      {error && <p className="text-red-500 text-sm font-semibold mt-4 text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

      <button
        type="submit"
        disabled={loading || selected.length === 0}
        className={`mt-8 w-full py-4 px-6 rounded-full font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 group ${dark ? 'bg-festara-gold text-[#0A1226] hover:bg-white hover:shadow-[0_0_20px_rgba(197,154,69,0.4)]' : 'bg-festara-navy text-white hover:bg-festara-gold hover:shadow-[0_10px_20px_rgba(197,154,69,0.3)]'} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            <span>{dict.confirmBtn}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </>
        )}
      </button>
    </form>
  );
}
