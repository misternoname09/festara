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

  const input =
    'w-full rounded-lg px-3 min-h-[48px] text-base border ' +
    (dark
      ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
      : 'bg-white border-black/15 text-festara-ink');

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
      <div className="rounded-xl p-5 bg-green-600/10 border border-green-600/30 text-left">
        <p className="font-semibold text-green-700">Présence confirmée ✅</p>
        <p className="mt-1 text-sm opacity-80">
          Ton Pass est prêt. Code : <strong>{result.pass_code}</strong>
        </p>
        <a href={passUrl} className="btn-primary w-full mt-4">
          Voir mon Pass
        </a>
        <a
          href={`https://wa.me/?text=${waText}`}
          className="btn-gold w-full mt-2"
          target="_blank"
          rel="noreferrer"
        >
          Envoyer sur WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="text-left space-y-4">
      <p className="font-semibold text-center">Confirmer ma présence</p>

      <div>
        <label className="text-sm font-medium">Ton prénom</label>
        <input
          className={input + ' mt-1'}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Ex : Fatou"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Nombre de personnes (toi inclus)</label>
        <input
          type="number"
          min={1}
          max={20}
          className={input + ' mt-1'}
          value={partySize}
          onChange={(e) => setPartySize(Math.max(1, Number(e.target.value)))}
        />
      </div>

      {ceremonies.length > 1 && (
        <div>
          <label className="text-sm font-medium">Cérémonies où tu viens</label>
          <div className="mt-2 space-y-2">
            {ceremonies.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={selected.includes(c.id)}
                  onChange={() => toggle(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Envoi…' : 'Je confirme ma présence'}
      </button>
    </form>
  );
}
