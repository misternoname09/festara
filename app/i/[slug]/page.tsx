import type { Metadata } from 'next';
import { getEventBySlug } from '@/lib/events';
import Invitation from '@/components/Invitation';

// Rendu dynamique (donnees a jour). Page legere : pas de JS lourd cote client.
export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

// Open Graph : apercu automatique sur WhatsApp (photo couple + nom + date)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: 'Invitation introuvable — Festara' };

  const first = event.ceremonies[0];
  const desc = first
    ? `${first.name} · ${first.location}`
    : 'Vous êtes convié(e) à notre célébration.';

  return {
    title: `${event.title} — Festara`,
    description: desc,
    openGraph: {
      title: event.title,
      description: desc,
      type: 'website',
      images: event.couple_photo_url ? [{ url: event.couple_photo_url }] : [],
    },
  };
}

import { createServerSupabase } from '@/lib/supabase/server';

export default async function InvitationPage({ params }: Props) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  let event = await getEventBySlug(params.slug);

  // Si l'événement n'est pas trouvé (probablement car is_published=false),
  // on vérifie si l'utilisateur actuel est le propriétaire de cet événement.
  if (!event && user) {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('slug', params.slug)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) event = data as typeof event;
  }

  if (!event) {
    // Écran de debug temporaire pour comprendre pourquoi Vercel renvoie 404
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'red' }}>🚨 Écran de Diagnostic (Debug)</h1>
        <p>L'invitation n'a pas pu être chargée.</p>
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', display: 'inline-block', textAlign: 'left', marginTop: '20px' }}>
          <p><strong>Slug cherché :</strong> {params.slug}</p>
          <p><strong>Êtes-vous connecté ?</strong> {user ? `Oui (${user.id})` : 'Non (user = null)'}</p>
          <p><strong>Explication :</strong> Si vous n'êtes pas connecté ici, le serveur refuse de vous montrer le brouillon. Assurez-vous d'ouvrir ce lien dans le même navigateur où vous êtes connecté au Dashboard.</p>
          <p><strong>Astuce Cache :</strong> Si l'événement devrait exister, essayez d'ajouter <code>?t=1</code> à l'URL pour forcer le cache Vercel.</p>
        </div>
      </div>
    );
  }

  let messages: any[] = [];
  
  if (params.slug === 'demo') {
    messages = [
      { id: '1', event_id: 'demo', author_name: 'Khady Diop', message: 'Félicitations pour votre mariage ! Que Dieu bénisse votre union.', created_at: new Date().toISOString() },
      { id: '2', event_id: 'demo', author_name: 'Moussa', message: 'Heureux ménage ! Je serai là avec toute la famille.', created_at: new Date().toISOString() }
    ];
  } else {
    const { data } = await supabase
      .from('guestbook_messages')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });
    if (data) messages = data;
  }

  return <Invitation event={event} messages={messages} />;
}
