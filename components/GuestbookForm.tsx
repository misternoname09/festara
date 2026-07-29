'use client';

import { useState } from 'react';

export default function GuestbookForm({
  eventId,
  isDark = false,
  dict,
}: {
  eventId: string;
  isDark?: boolean;
  dict: any;
}) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputClass =
    'w-full rounded-2xl px-4 text-sm border focus:ring-2 focus:outline-none transition-all ' +
    (isDark
      ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-white/50 focus:bg-white/20'
      : 'bg-white/60 border-black/10 text-festara-navy placeholder-festara-ink/40 focus:ring-[#C59A45]/50 focus:bg-white');

  const labelClass = 'block text-xs font-bold uppercase tracking-widest ml-1 mb-1.5 ' + (isDark ? 'text-white/80' : 'text-festara-navy');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !message.trim()) return setError('Tous les champs sont requis.');
    if (message.length > 500) return setError('Votre message est trop long (max 500 caractères).');

    setLoading(true);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, author_name: name, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'envoi.');
      setSuccess(true);
      
      // On recharge la page pour voir le nouveau message apparaitre dans la liste
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={`p-6 text-center rounded-3xl border ${isDark ? 'bg-white/5 border-white/20' : 'bg-green-50 border-green-200'}`}>
        <p className="text-3xl mb-2">✨</p>
        <p className={`font-serif text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-green-800'}`}>Message envoyé !</p>
        <p className={`text-sm ${isDark ? 'text-white/70' : 'text-green-700/80'}`}>Merci pour vos mots doux. Actualisation...</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="text-left space-y-5 relative">
      <div>
        <label className={labelClass}>{dict.guestbookNameLabel}</label>
        <input
          type="text"
          maxLength={50}
          className={`${inputClass} min-h-[48px]`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={dict.namePlaceholder}
        />
      </div>

      <div>
        <label className={labelClass}>{dict.guestbookMsgLabel}</label>
        <textarea
          className={`${inputClass} py-3 resize-none h-24`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={dict.guestbookMsgPlaceholder}
          maxLength={500}
        />
      </div>

      {error && <p className="text-xs text-red-600 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all group flex items-center justify-center gap-2 ${isDark ? 'bg-white/10 text-white hover:bg-white hover:text-[#0A1226]' : 'bg-festara-navy/5 text-festara-navy hover:bg-festara-navy hover:text-white'} disabled:opacity-50`}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            <span>{dict.guestbookBtn}</span>
            <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">✍️</span>
          </>
        )}
      </button>
    </form>
  );
}
