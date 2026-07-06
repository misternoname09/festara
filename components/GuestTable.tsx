'use client';

import { useState } from 'react';
import { GuestRow } from '@/lib/types';

export default function GuestTable({ guests }: { guests: GuestRow[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = Math.ceil(guests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGuests = guests.slice(startIndex, startIndex + itemsPerPage);

  if (guests.length === 0) {
    return (
      <div className="text-center py-16 bg-[#FDFBF7] rounded-[1.5rem] border border-dashed border-[#0A1226]/10">
        <p className="text-base text-[#0A1226]/60 font-medium mb-2">Votre liste d'invités est vide.</p>
        <p className="text-xs text-[#0A1226]/40 uppercase tracking-widest font-bold">Utilisez le module d'import Excel à droite pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/5 text-[#0A1226]/40 uppercase tracking-widest text-[10px] font-bold">
            <th className="pb-4 pl-4">Nom Complet</th>
            <th className="pb-4 text-center">Personnes</th>
            <th className="pb-4 text-center">RSVP</th>
            <th className="pb-4 text-center">Statut Jour-J</th>
          </tr>
        </thead>
        <tbody>
          {currentGuests.map((g) => (
            <tr key={g.id} className="border-b border-black/[0.02] hover:bg-black/[0.02] transition-colors">
              <td className="py-4 pl-4 font-bold text-[#0A1226]">{g.first_name}</td>
              <td className="py-4 text-center text-[#0A1226]/70 font-mono text-xs"><span className="bg-[#FDFBF7] border border-black/5 px-3 py-1 rounded-lg">{g.party_size}</span></td>
              <td className="py-4 text-center">
                {g.rsvp_confirmed_at ? (
                  <span className="px-3 py-1.5 bg-green-500/10 text-green-700 border border-green-500/20 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em]">Confirmé</span>
                ) : (
                  <span className="px-3 py-1.5 bg-gray-500/10 text-gray-500 border border-gray-500/20 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em]">En attente</span>
                )}
              </td>
              <td className="py-4 text-center">
                {g.scanned_at ? (
                  <span className="px-3 py-1.5 bg-festara-gold/10 text-festara-gold border border-festara-gold/20 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em]">Scanné</span>
                ) : (
                  <span className="text-[#0A1226]/20 font-bold">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-black/5 mt-4">
          <div className="text-xs text-[#0A1226]/50">
            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, guests.length)} sur {guests.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-black/10 text-xs font-bold disabled:opacity-30 hover:bg-black/5 transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-black/10 text-xs font-bold disabled:opacity-30 hover:bg-black/5 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
