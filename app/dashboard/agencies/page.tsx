import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import AgencyCard from '@/components/AgencyCard';

export const dynamic = 'force-dynamic';

export default async function AgenciesPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: orgsData } = await supabase
    .from('organizations')
    .select('*, organization_members(user_id, role), agency_invitations(id, email, role, token, created_at, accepted_at)')
    .order('created_at', { ascending: false });
  
  const orgs = orgsData || [];

  return (
    <main className="min-h-screen bg-[#FDFBF7] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-sm font-bold text-festara-navy/50 hover:text-festara-navy uppercase tracking-widest mb-4 inline-block">← Retour au Dashboard</Link>
            <h1 className="text-4xl font-serif text-festara-navy font-bold">Mes Agences</h1>
            <p className="text-festara-navy/60 mt-2">Gérez vos organisations B2B et collaborez avec votre équipe.</p>
          </div>
        </div>

        {orgs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-black/5 text-center shadow-sm">
            <span className="text-4xl mb-4 block">🏢</span>
            <h2 className="text-xl font-bold text-festara-navy mb-2">Vous n'avez pas encore d'agence</h2>
            <p className="text-festara-navy/60 mb-6">Créez une agence pour regrouper vos événements, inviter des collaborateurs, et accéder au <strong className="text-festara-gold">Pack Agence Pro (25 événements)</strong>.</p>
            
            <form action={async (formData) => {
              'use server';
              const { createAgencyAction } = await import('./actions');
              await createAgencyAction(formData);
            }} className="max-w-md mx-auto space-y-4">
              <input type="text" name="name" required placeholder="Nom de votre agence (ex: Festara Event Planner)" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
              <button type="submit" className="w-full py-3 bg-festara-navy text-white font-bold rounded-xl hover:bg-festara-ink transition-colors">Créer mon agence</button>
            </form>
          </div>
        ) : (
          <div className="grid gap-6">
            {orgs.map((org: any) => (
              <AgencyCard key={org.id} org={org} />
            ))}

            <div className="bg-festara-sand/30 p-8 rounded-3xl border border-festara-gold/20 mt-8">
              <h3 className="font-bold text-festara-navy mb-4">Créer une autre agence</h3>
              <form action={async (formData) => {
                'use server';
                const { createAgencyAction } = await import('./actions');
                await createAgencyAction(formData);
              }} className="flex gap-4 max-w-md">
                <input type="text" name="name" required placeholder="Nom de l'agence" className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm" />
                <button type="submit" className="px-6 py-2 bg-festara-navy text-white text-sm font-bold rounded-xl hover:bg-festara-ink transition-colors">Créer</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
