import { redirect } from 'next/navigation';
import { createServerSupabase, createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from('agency_invitations')
    .select('*, organizations(name)')
    .eq('token', params.token)
    .single();

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

  if (invite.accepted_at) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-3xl border border-black/5 text-center max-w-md w-full shadow-xl">
          <span className="text-4xl mb-4 block">✅</span>
          <h1 className="text-2xl font-serif font-bold text-festara-navy mb-4">Invitation déjà acceptée</h1>
          <p className="text-festara-navy/60 mb-8">Vous avez déjà rejoint l'agence {invite.organizations?.name}.</p>
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
          <h1 className="text-2xl font-serif font-bold text-festara-navy mb-2">Invitation B2B</h1>
          <p className="text-festara-navy/80 mb-6 font-medium">Vous avez été invité(e) à rejoindre l'agence :<br/><span className="text-festara-gold font-bold text-xl">{invite.organizations?.name}</span></p>
          
          <div className="bg-festara-sand/30 p-4 rounded-xl mb-8">
            <p className="text-sm text-festara-navy/60">Connectez-vous ou créez un compte avec l'adresse :<br/><strong className="text-festara-navy">{invite.email}</strong></p>
          </div>

          <Link href={`/login?next=/invite/${params.token}`} className="block w-full px-8 py-3 bg-festara-navy text-white font-bold rounded-xl hover:bg-festara-ink transition-colors">Me connecter ou m'inscrire</Link>
        </div>
      </main>
    );
  }

  // S'il est connecté mais pas avec le bon email
  if (user.email !== invite.email) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-3xl border border-black/5 text-center max-w-md w-full shadow-xl">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h1 className="text-2xl font-serif font-bold text-festara-navy mb-4">Mauvais compte</h1>
          <p className="text-festara-navy/60 mb-6">Cette invitation est destinée à <strong>{invite.email}</strong>, mais vous êtes connecté(e) en tant que <strong>{user.email}</strong>.</p>
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

  // S'il est connecté avec le bon email, afficher le bouton d'acceptation
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-3xl border border-black/5 text-center max-w-md w-full shadow-xl">
        <span className="text-4xl mb-4 block">🤝</span>
        <h1 className="text-2xl font-serif font-bold text-festara-navy mb-2">Rejoindre l'équipe</h1>
        <p className="text-festara-navy/80 mb-8 font-medium">Acceptez l'invitation pour accéder à l'agence :<br/><span className="text-festara-gold font-bold text-xl">{invite.organizations?.name}</span></p>
        
        <form action={async () => {
          'use server';
          const { acceptInvitationAction } = await import('@/app/dashboard/agencies/actions');
          await acceptInvitationAction(params.token);
          redirect('/dashboard/agencies');
        }}>
          <button className="w-full px-8 py-4 bg-festara-navy text-white font-bold rounded-xl hover:bg-festara-ink transition-all hover:shadow-[0_10px_20px_rgba(10,18,38,0.2)] hover:-translate-y-1">
            Accepter l'invitation
          </button>
        </form>
      </div>
    </main>
  );
}
