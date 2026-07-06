'use client';

import { useState } from 'react';
import { requestPayoutAction } from '@/app/dashboard/[id]/payout-actions';

type Props = {
  eventId: string;
  availableBalance: number;
  payouts: any[]; // On pourrait typer plus précisément, mais on garde simple
};

export default function PayoutRequest({ eventId, availableBalance, payouts }: Props) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseInt(amount, 10);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Montant invalide.");
      return;
    }
    if (numAmount > availableBalance) {
      setError("Le montant demandé dépasse votre solde disponible.");
      return;
    }

    setLoading(true);
    try {
      await requestPayoutAction(eventId, numAmount, bankDetails);
      setAmount('');
      setBankDetails('');
      alert("Demande de reversement envoyée avec succès !");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la demande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-green-600 shadow-inner border border-white text-xl">💸</div>
        <h2 className="text-2xl font-bold text-[#0A1226] font-serif">Reversements</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="mb-8">
            <p className="text-xs font-bold text-[#0A1226]/50 uppercase tracking-wider mb-2">Solde Disponible</p>
            <p className="text-4xl font-serif text-festara-gold">{availableBalance.toLocaleString()} FCFA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-festara-navy mb-2">Montant à retirer (FCFA)</label>
              <input
                type="number"
                min="1000"
                max={availableBalance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-festara-gold focus:border-festara-gold"
                placeholder="Ex: 50000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-festara-navy mb-2">Coordonnées (Wave / Orange Money)</label>
              <input
                type="text"
                required
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-festara-gold focus:border-festara-gold"
                placeholder="Ex: Wave - 77 123 45 67 (Prénom Nom)"
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            
            <button
              type="submit"
              disabled={loading || availableBalance <= 0}
              className="w-full py-3 bg-festara-navy text-white font-bold rounded-lg hover:bg-festara-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Envoi en cours..." : "Demander le reversement"}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-bold text-festara-navy mb-4">Historique des demandes</h3>
          {payouts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Aucune demande de reversement.</p>
          ) : (
            <div className="space-y-3">
              {payouts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-xl border border-black/5">
                  <div>
                    <p className="font-bold text-sm text-festara-navy">{p.amount.toLocaleString()} FCFA</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(p.created_at).toLocaleDateString('fr-FR')} - {p.bank_details}</p>
                  </div>
                  <div>
                    {p.status === 'pending' && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">En attente</span>}
                    {p.status === 'processed' && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Traité</span>}
                    {p.status === 'rejected' && <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Rejeté</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
