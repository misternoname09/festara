'use client';

import { useState } from 'react';
import type { GuestRow } from '@/lib/types';

export default function WhatsAppDispatcher({ guests, eventSlug, eventId, plan }: { guests: GuestRow[], eventSlug: string, eventId: string, plan: string }) {
  const [guestList, setGuestList] = useState(guests);
  const [mode, setMode] = useState<'invite' | 'remind'>('invite');
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<{sent: number, failed: number} | null>(null);

  const isPro = plan === 'pro' || plan === 'premium';
  const isDryRun = process.env.NEXT_PUBLIC_WHATSAPP_DRY_RUN === 'true';

  const importedGuests = guestList.filter(g => g.phone);
  
  // En mode relance, on ne montre que ceux qui n'ont pas encore de rsvp_confirmed_at
  const displayedGuests = mode === 'remind' 
    ? importedGuests.filter(g => !g.rsvp_confirmed_at)
    : importedGuests;

  if (importedGuests.length === 0) {
    return (
      <div className="bg-white/50 rounded-2xl p-6 border border-black/5 text-center text-festara-ink/60 text-sm">
        Aucun invité avec numéro de téléphone n'a été importé.
      </div>
    );
  }

  const handleSend = async (guestId: string, phone: string, name: string, passUuid: string) => {
    // URL du Pass
    const passUrl = `${window.location.origin}/i/${eventSlug}/pass/${passUuid}`;
    
    // Message contextuel (Invitation vs Relance)
    const message = mode === 'invite'
      ? `Salam ${name} ! Voici votre Pass VIP pour notre événement Festara. Cliquez sur ce lien pour confirmer votre présence et afficher votre code d'accès : ${passUrl}`
      : `Salam ${name}, nous espérons vous compter parmi nous ! N'oubliez pas de confirmer votre présence le plus tôt possible via ce lien : ${passUrl}`;
    
    // Nettoyage du numéro
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Lien WhatsApp Web/Mobile
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    // Mettre à jour l'état local
    setGuestList(prev => prev.map(g => g.id === guestId ? { ...g, whatsapp_sent: true } : g));

    // Mettre à jour en BDD (Optionnel)
    fetch('/api/guests/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_id: guestId })
    });
  };

  const handleBulkSend = async () => {
    if (!isPro) {
      alert("L'envoi en masse est réservé aux plans Pro/Premium.");
      return;
    }
    
    if (!confirm(`Envoyer automatiquement un message WhatsApp à tous les invités de cette liste (${displayedGuests.length} personnes) ?`)) return;
    
    setIsSendingBulk(true);
    setBulkResult(null);
    try {
      const res = await fetch('/api/guests/whatsapp/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, mode })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }
      
      setBulkResult({ sent: data.sent, failed: data.failed });
      
      // Update local state for those successfully sent
      if (mode === 'invite' && data.sent > 0) {
        setGuestList(prev => prev.map(g => {
          // Simplification: on suppose que si ça a marché, c'est bon pour tous ceux de la liste ciblée.
          // En vrai, il faudrait que l'API renvoie les IDs réussis, mais pour l'UX on marque tout.
          const inDisplay = displayedGuests.some(dg => dg.id === g.id);
          return inDisplay ? { ...g, whatsapp_sent: true } : g;
        }));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSendingBulk(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="p-5 border-b border-black/5 bg-festara-sand/30 flex flex-col gap-4">
        <h3 className="font-bold text-festara-navy font-serif text-lg flex items-center gap-2">
          <span className="text-2xl">📱</span> Module WhatsApp
        </h3>
        
        {/* Toggle Mode */}
        <div className="flex p-1 bg-white rounded-xl border border-black/5 shadow-inner">
          <button 
            onClick={() => setMode('invite')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'invite' ? 'bg-[#25D366] text-white shadow-sm' : 'text-festara-ink/50 hover:text-festara-navy'}`}
          >
            Invitations ({importedGuests.length})
          </button>
          <button 
            onClick={() => setMode('remind')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'remind' ? 'bg-amber-500 text-white shadow-sm' : 'text-festara-ink/50 hover:text-festara-navy'}`}
          >
            Relances ({importedGuests.filter(g => !g.rsvp_confirmed_at).length})
          </button>
        </div>
        
        {/* Bulk Send Button */}
        <div className="mt-2">
          {isPro ? (
            <button
              onClick={handleBulkSend}
              disabled={isSendingBulk || displayedGuests.length === 0}
              className="w-full py-3 bg-festara-gold text-white font-bold rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-600 transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-1"
            >
              <span>{isSendingBulk ? "Envoi en cours..." : "Envoyer à tous (Automatique)"}</span>
              {isDryRun && <span className="text-[9px] bg-white/20 px-2 rounded-full mt-1">Mode Simulation (Dry-Run)</span>}
            </button>
          ) : (
            <div className="w-full py-3 bg-gray-100 text-gray-500 font-bold rounded-lg uppercase tracking-widest text-xs flex items-center justify-center border border-dashed border-gray-300">
              Envoi automatique (Plan Pro requis)
            </div>
          )}
          {bulkResult && (
            <p className={`text-xs mt-2 text-center font-bold ${bulkResult.failed > 0 ? 'text-red-500' : 'text-green-500'}`}>
              Résultat : {bulkResult.sent} envoyé(s), {bulkResult.failed} échec(s).
            </p>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
        {displayedGuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
            <span className="text-3xl mb-2">🎉</span>
            <p className="text-sm font-bold">Tous les invités de cette liste ont été gérés !</p>
          </div>
        ) : (
          displayedGuests.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-4 mb-2 rounded-xl border border-black/5 hover:bg-black/[0.02] hover:border-black/10 transition-all">
              <div>
                <p className="font-bold text-festara-navy text-sm">{g.first_name}</p>
                <p className="text-xs text-festara-ink/60 font-mono">{g.phone}</p>
              </div>
              <button
                onClick={() => handleSend(g.id, g.phone!, g.first_name, g.pass_uuid)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 shadow-sm
                  ${g.whatsapp_sent 
                    ? 'bg-gray-100 text-gray-500 border border-gray-200' 
                    : mode === 'remind' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-[#25D366] text-white hover:bg-[#1DA851]'
                  }`}
              >
                {g.whatsapp_sent ? 'Renvoyé ✓' : (mode === 'remind' ? 'Relancer' : 'Envoyer')}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
