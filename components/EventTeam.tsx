'use client';

import { useState } from 'react';
import { createEventInvitationAction, deleteEventInvitationAction, removeEventCollaboratorAction } from '@/app/dashboard/actions';

export default function EventTeam({ 
  eventId, 
  collaborators, 
  invitations 
}: { 
  eventId: string, 
  collaborators: any[], 
  invitations: any[] 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [role, setRole] = useState('co_host');

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createEventInvitationAction(eventId, role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  }

  const pendingInvites = invitations.filter((inv: any) => !inv.accepted_at);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Colonne gauche : Générer un lien */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white relative overflow-hidden">
        <h2 className="text-2xl font-bold text-[#0A1226] font-serif flex items-center gap-4 mb-6 relative z-10">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner border border-white text-xl">🤝</span>
          Inviter un collaborateur
        </h2>
        <p className="text-sm text-[#0A1226]/60 mb-6">
          Générez un lien d'invitation "magique" à envoyer via WhatsApp à un co-organisateur ou à un hôte d'accueil.
        </p>

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#0A1226]/70 uppercase tracking-[0.2em] ml-1 mb-2">Rôle</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl px-6 py-4 text-base border-2 border-[#0A1226]/5 bg-[#FDFBF7] focus:bg-white focus:border-festara-gold/50 outline-none transition-all font-medium"
            >
              <option value="co_host">Co-organisateur (Accès complet)</option>
              <option value="scanner">Hôte d'accueil (Scanner QR Code Uniquement)</option>
            </select>
          </div>
          
          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#0A1226] text-white font-bold rounded-2xl hover:bg-[#0A1226]/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Générer le lien magique'}
          </button>
        </form>
      </div>

      {/* Colonne droite : Liste */}
      <div className="space-y-8">
        
        {/* Liens en attente */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white">
          <h3 className="text-sm font-bold text-[#0A1226] uppercase tracking-widest mb-4">Invitations en attente ({pendingInvites.length})</h3>
          {pendingInvites.length === 0 ? (
            <p className="text-xs text-[#0A1226]/40 italic">Aucun lien en attente.</p>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((inv: any) => (
                <div key={inv.id} className="bg-[#FDFBF7] p-4 rounded-2xl border border-black/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A1226] uppercase">{inv.role === 'co_host' ? 'Co-organisateur' : 'Scanner'}</span>
                    <button 
                      onClick={async () => {
                        if (confirm('Supprimer ce lien ?')) await deleteEventInvitationAction(inv.id);
                      }} 
                      className="text-red-500 text-xs font-bold hover:underline"
                    >
                      Annuler
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-black/5">
                    <span className="text-[10px] text-[#0A1226]/40 truncate flex-1 pl-2">.../invite/{inv.token.substring(0, 8)}...</span>
                    <button 
                      onClick={() => copyLink(inv.token)}
                      className="px-4 py-2 bg-[#0A1226] text-white text-[10px] font-bold rounded-lg hover:bg-festara-gold transition-colors"
                    >
                      {copiedToken === inv.token ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Équipe actuelle */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white">
          <h3 className="text-sm font-bold text-[#0A1226] uppercase tracking-widest mb-4">Équipe Active ({collaborators.length})</h3>
          {collaborators.length === 0 ? (
            <p className="text-xs text-[#0A1226]/40 italic">Seul le propriétaire a accès pour l'instant.</p>
          ) : (
            <div className="space-y-3">
              {collaborators.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between bg-[#FDFBF7] p-4 rounded-2xl border border-black/5">
                  <div>
                    {/* fallback to display user_id since we might not join users easily via RLS */}
                    <p className="font-bold text-[#0A1226] text-sm">Utilisateur ID: {c.user_id.substring(0,8)}...</p>
                    <p className="text-[10px] text-[#0A1226]/50 uppercase tracking-widest font-bold mt-1">
                      {c.role === 'co_host' ? 'Co-organisateur' : 'Scanner'}
                    </p>
                  </div>
                  <button 
                    onClick={async () => {
                      if (confirm('Retirer cet accès ?')) await removeEventCollaboratorAction(c.event_id, c.user_id);
                    }}
                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                    title="Retirer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
