'use client';

import { useState } from 'react';
import type { GuestRow } from '@/lib/types';

export default function WhatsAppDispatcher({ guests, eventSlug }: { guests: GuestRow[], eventSlug: string }) {
  const [guestList, setGuestList] = useState(guests);

  const importedGuests = guestList.filter(g => g.phone);

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
    
    // Message pré-rempli (personnalisé)
    const message = `Salam ${name} ! Voici votre Pass VIP pour notre événement Festara. Cliquez sur ce lien pour afficher votre code d'accès : ${passUrl}`;
    
    // Nettoyage du numéro (retirer le + ou les espaces, s'assurer que c'est le bon format pour wa.me)
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Lien WhatsApp Web/Mobile
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(waUrl, '_blank');

    // Mettre à jour l'état local pour le style
    setGuestList(prev => prev.map(g => g.id === guestId ? { ...g, whatsapp_sent: true } : g));

    // Mettre à jour en BDD (Optionnel mais recommandé pour le suivi)
    fetch('/api/guests/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_id: guestId })
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-black/5 bg-festara-sand/30 flex justify-between items-center">
        <h3 className="font-bold text-festara-navy">Envois WhatsApp ({importedGuests.filter(g => g.whatsapp_sent).length}/{importedGuests.length})</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {importedGuests.map((g) => (
          <div key={g.id} className="flex items-center justify-between p-4 border-b border-black/5 hover:bg-black/[0.02] transition-colors">
            <div>
              <p className="font-bold text-festara-navy text-sm">{g.first_name}</p>
              <p className="text-xs text-festara-ink/60 font-mono">{g.phone}</p>
            </div>
            <button
              onClick={() => handleSend(g.id, g.phone!, g.first_name, g.pass_uuid)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 shadow-sm
                ${g.whatsapp_sent 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-[#25D366] text-white hover:bg-[#1DA851]'
                }`}
            >
              {g.whatsapp_sent ? 'Renvoyer' : 'Envoyer 📱'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
