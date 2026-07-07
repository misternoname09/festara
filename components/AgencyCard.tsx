'use client';

import { useState } from 'react';
import { createInvitationAction, deleteInvitationAction, removeMemberAction } from '@/app/dashboard/agencies/actions';
import AgencyPayButton from './AgencyPayButton';

export default function AgencyCard({ org }: { org: any }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createInvitationAction(org.id, email);
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteInvite(id: string) {
    if (confirm('Voulez-vous annuler cette invitation ?')) {
      await deleteInvitationAction(id);
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  }

  const pendingInvites = org.agency_invitations?.filter((inv: any) => !inv.accepted_at) || [];

  return (
    <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-black/5 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-festara-navy font-serif mb-1">{org.name}</h2>
          <div className="flex gap-3 mt-3">
            <span className="px-3 py-1 bg-festara-gold/10 text-festara-gold text-xs font-bold uppercase tracking-widest rounded-full">Plan {org.plan}</span>
            <span className="px-3 py-1 bg-black/5 text-festara-navy/60 text-xs font-bold uppercase tracking-widest rounded-full">
              Membres Actifs: {org.organization_members?.length || 1}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-festara-navy uppercase tracking-widest mb-4">Inviter un collaborateur</h3>
          <form onSubmit={handleInvite} className="space-y-3">
            <input 
              type="email" 
              placeholder="Email (Optionnel) pour sécuriser le lien" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-festara-gold outline-none"
            />
            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-festara-navy text-white text-sm font-bold rounded-xl hover:bg-festara-ink transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Générer le lien'}
            </button>
          </form>
          <p className="text-xs text-festara-navy/40 mt-3 max-w-xs">
            Générez un lien magique à partager avec votre collaborateur. Il pourra créer son compte et rejoindre l'agence automatiquement.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-festara-navy uppercase tracking-widest mb-4">Invitations en attente ({pendingInvites.length})</h3>
          {pendingInvites.length === 0 ? (
            <p className="text-xs text-festara-navy/40 italic">Aucune invitation en attente.</p>
          ) : (
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
              {pendingInvites.map((inv: any) => (
                <div key={inv.id} className="bg-festara-sand/20 p-3 rounded-xl border border-festara-gold/10 text-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-festara-navy">{inv.email}</span>
                    <button onClick={() => handleDeleteInvite(inv.id)} className="text-red-500 text-xs font-bold hover:underline">Annuler</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => copyLink(inv.token)}
                      className="px-3 py-1 bg-white border border-festara-gold/30 text-festara-gold text-xs font-bold rounded-lg hover:bg-festara-gold/10"
                    >
                      {copiedToken === inv.token ? 'Copié !' : 'Copier le lien'}
                    </button>
                    <span className="text-[10px] text-festara-navy/40">Créé le {new Date(inv.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-black/5 mt-8">
        <AgencyPayButton organizationId={org.id} currentPlan={org.plan} />
      </div>
    </div>
  );
}
