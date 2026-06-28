'use client';

import { useState } from 'react';

export default function AiTextGenerator({ initialText, title }: { initialText: string | null; title: string }) {
  const [text, setText] = useState(initialText || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateText() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur inconnue');
      }
      
      setText(data.text);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-festara-navy uppercase tracking-wider ml-1">
          Mot de Bienvenue
        </label>
        
        <button 
          type="button" 
          onClick={generateText} 
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-festara-gold/10 text-festara-gold border border-festara-gold/30 hover:bg-festara-gold hover:text-white transition-all shadow-sm"
        >
          {loading ? (
            <span className="animate-pulse">Génération...</span>
          ) : (
            <>
              <span className="animate-bounce">✨</span> Rédiger avec l'IA
            </>
          )}
        </button>
      </div>
      
      <textarea 
        name="welcome_message" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Tapez votre texte d'invitation ici ou laissez l'IA l'écrire pour vous..." 
        className="w-full rounded-2xl px-4 py-3 min-h-[120px] text-base border border-festara-navy/10 bg-white/60 focus:bg-white focus:ring-2 focus:ring-festara-gold/50 outline-none transition-all placeholder:text-festara-ink/30 resize-none leading-relaxed"
      />
      
      {error && (
        <p className="text-[10px] font-bold text-red-500 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
