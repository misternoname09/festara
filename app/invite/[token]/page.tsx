import { redirect } from 'next/navigation';
import { createServerSupabase, createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  // 1. Chercher dans event_invitations
  let { data: eventInv } = await admin
    .from('event_invitations')
    .select('*, events(title)')
    .eq('token', params.token)
    .single();

  // 2. Sinon chercher dans agency_invitations
  let agencyInv = null;
  if (!eventInv) {
    const { data } = await admin
      .from('agency_invitations')
      .select('*, organizations(name)')
      .eq('token', params.token)
      .single();
    agencyInv = data;
  }

  const invite = eventInv || agencyInv;

  if (!invite) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-3xl border border-black/5 text-center max-w-md w-full shadow-xl">
          <span className="text-4xl mb-4 block">❌</span>
          <h1 className="text-2xl font-serif font-bold text-festara-navy mb-4">Lien Invalide</h1>
          <p className="text-festara-navy/60 mb-8">Ce lien d'invitation n'existe pas ou a expiré.</p>
          <Link href="/" className="inline-block px-8 py-3 bg-festara-navy text-white font-bold rounded-xl hover:bg-festara-ink transition-colors">Retour à l'accueil</Link>
        </div>
      </main>
    );
  }

  const targetName = eventInv ? eventInv.events?.title : agencyInv.organizations?.name;
  const targetLabel = eventInv ? 'l\'événement' : 'l\'agence';

  if (invite.accepted_at) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-3xl border border-black/5 text-center max-w-md w-full shadow-xl">
          <span className="text-4xl mb-4 block">✅</span>
          <h1 className="text-2xl font-serif font-bold text-festara-navy mb-4">Invitation déjà acceptée</h1>
          <p className="text-festara-navy/60 mb-8">Ce lien a déjà été utilisé pour {targetLabel} {targetName}.</p>
          <Link href="/dashboard" className="inline-block px-8 py-3 bg-festara-navy text-white font-bold rounded-xl hover:bg-festara-ink transition-colors">Aller au Dashboard</Link>
        </div>
      </main>
    );
  }

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-3xl border border-black/5 text-center max-w-md w-full shadow-xl">
          <span className="text-4xl mb-4 block">👋</span>
          <h1 className="text-2xl font-serif font-bold text-festara-navy mb-2">Invitation Collaborateur</h1>
          <p className="text-festara-navy/80 mb-6 font-medium">Vous avez été invité(e) à rejoindre {targetLabel} :<br/><span className="text-festara-gold font-bold text-xl">{targetName}</span></p>
          
          <div className="bg-festara-sand/30 p-4 rounded-xl mb-8">
            <p className="text-sm text-festara-navy/60">
              Connectez-vous ou créez un compte gratuit pour accepter l'invitation.
              {invite.email && <><br/>Veuillez utiliser l'adresse : <strong className="text-festara-navy">{invite.email}</strong></>}
            </p>
          </div>

          <Link href={`/login?next=/invite/${params.token}`} className="block w-full px-8 py-3 bg-festara-navy text-white font-bold rounded-xl hover:bg-festara-ink transition-colors">Me connecter ou m'inscrire</Link>
        </div>
      </main>
    );
  }

  // S'il est connecté mais pas avec le bon email (uniquement si l'invitation a un email restrictif)
  if (invite.email && user.email !== invite.email) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-3xl border border-black/5 text-center max-w-md w-full shadow-xl">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h1 className="text-2xl font-serif font-bold text-festara-navy mb-4">Mauvais compte</h1>
          <p className="text-festara-navy/60 mb-6">Cette invitation est strictement destinée à <strong>{invite.email}</strong>, mais vous êtes connecté(e) en tant que <strong>{user.email}</strong>.</p>
          <form action={async () => {
            'use server';
            const { createServerSupabase } = await import('@/lib/supabase/server');
            const supabase = createServerSupabase();
            await supabase.auth.signOut();
            redirect(`/login?next=/invite/${params.token}`);
          }}>
            <button className="w-full px-8 py-3 border-2 border-festara-navy text-festara-navy font-bold rounded-xl hover:bg-festara-navy hover:text-white transition-colors">Déconnexion</button>
          </form>
        </div>
      </main>
    );
  }

  // S'il est connecté (et que l'email correspond ou que le lien est magique), afficher le bouton d'acceptation
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-3xl border border-black/5 text-center max-w-md w-full shadow-xl">
        <span className="text-4xl mb-4 block">🤝</span>
        <h1 className="text-2xl font-serif font-bold text-festara-navy mb-2">Rejoindre l'équipe</h1>
        <p className="text-festara-navy/80 mb-8 font-medium">Acceptez l'invitation pour accéder à {targetLabel} :<br/><span className="text-festara-gold font-bold text-xl">{targetName}</span></p>
        
        <form action={async () => {
          'use server';
          const { createAdminClient } = await import('@/lib/supabase/server');
          const adminClient = createAdminClient();
          
          if (eventInv) {
            await adminClient.from('event_collaborators').insert({
              event_id: eventInv.event_id,
              user_id: user.id,
              role: eventInv.role
            });
            await adminClient.from('event_invitations').update({ accepted_at: new Date().toISOString() }).eq('id', eventInv.id);
            redirect(`/dashboard/${eventInv.event_id}`);
          } else {
            await adminClient.from('organization_members').insert({
              organization_id: agencyInv.organization_id,
              user_id: user.id,
              role: agencyInv.role
            });
            await adminClient.from('agency_invitations').update({ accepted_at: new Date().toISOString() }).eq('id', agencyInv.id);
            redirect('/dashboard/agencies');
          }
        }}>
          <button className="w-full px-8 py-4 bg-festara-navy text-white font-bold rounded-xl hover:bg-festara-ink transition-all hover:shadow-[0_10px_20px_rgba(10,18,38,0.2)] hover:-translate-y-1">
            Accepter l'invitation
          </button>
        </form>
      </div>
    </main>
  );
}
