'use client';

import { useState } from 'react';

export default function GuestbookForm({ eventId, isDark }: { eventId: string; isDark: boolean }) {
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

  const labelClass = 'block text-[10px] font-bold uppercase tracking-widest ml-1 mb-1.5 ' + (isDark ? 'text-white/80' : 'text-festara-navy');

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
        <label className={labelClass}>Votre prénom / nom</label>
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
        <label className={labelClass}>Votre message</label>
        <textarea
          className={`${inputClass} py-3 resize-none h-24`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Laissez un mot aux mariés..."
          maxLength={500}
        />
      </div>

      {error && <p className="text-xs text-red-600 text-center">{error}</p>}

      <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 shadow-xl ${isDark ? 'bg-white text-[#1A2A4A] hover:bg-white/90' : 'bg-[#1A2A4A] text-white hover:bg-[#1A2A4A]/90'}`}>
        {loading ? 'Envoi...' : 'Publier mon message'}
      </button>
    </form>
  );
}
