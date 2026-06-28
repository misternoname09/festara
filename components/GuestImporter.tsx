'use client';

import { useState } from 'react';

export default function GuestImporter({ eventId }: { eventId: string }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleImport() {
    setError(null);
    if (!text.trim()) {
      setError('Veuillez coller une liste.');
      return;
    }

    // Analyse rudimentaire : chaque ligne est un invité. On sépare par virgule, tiret ou tabulation.
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const guests = lines.map(line => {
      // Extraction basique : Si la ligne contient des chiffres, on suppose que c'est le numéro
      const phoneMatch = line.match(/[\d\s\+\-\.]{7,}/);
      const phone = phoneMatch ? phoneMatch[0].replace(/[^\d\+]/g, '') : null;
      let name = line;
      if (phoneMatch) {
        name = line.replace(phoneMatch[0], '').replace(/[,;\-]/g, '').trim();
      }
      return { name: name || 'Invité Inconnu', phone };
    });

    if (guests.length === 0) {
      setError('Aucun invité trouvé.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/guests/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, guests }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'import.');
      setSuccess(true);
      setText('');
      // Recharge la page pour mettre à jour la liste des envois WhatsApp
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
      <h3 className="text-lg font-bold text-festara-navy font-serif mb-2">Importer une liste</h3>
      <p className="text-xs text-festara-ink/60 mb-4 leading-relaxed">
        Collez ici votre liste Excel. Une ligne par invité. <br/>
        Exemple : <strong>Aïda Ndiaye 771234567</strong> ou <strong>Modou, 779876543</strong>
      </p>

      {success ? (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center text-sm font-bold">
          ✅ Invités importés avec succès !
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            className="w-full h-32 p-3 rounded-xl border border-black/10 text-sm focus:ring-2 focus:ring-festara-teal/30 focus:border-festara-teal outline-none resize-none"
            placeholder="Collez votre liste ici..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleImport}
            disabled={loading || !text.trim()}
            className="w-full py-3 bg-festara-teal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#084848] transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Importation...' : 'Générer les Pass VIP'}
          </button>
        </div>
      )}
    </div>
  );
}
