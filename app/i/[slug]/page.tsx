import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { getEventBySlug } from '@/lib/events';
import Invitation from '@/components/Invitation';
import Script from 'next/script';
import { createServerSupabase } from '@/lib/supabase/server';
import { headers } from 'next/headers';

// Rendu dynamique (donnees a jour). Page legere : pas de JS lourd cote client.
export const dynamic = 'force-dynamic';

type Props = { params: { slug: string }, searchParams?: { ref?: string } };

// Open Graph : apercu automatique sur WhatsApp (photo couple + nom + date)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: 'Invitation introuvable — Festara' };

  const first = event.ceremonies[0];
  const desc = first
    ? `${first.name} · ${first.location}`
    : 'Vous êtes convié(e) à notre célébration.';

  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const ogUrl = `${protocol}://${host}/api/og?slug=${params.slug}`;

  return {
    title: `${event.title} — Festara`,
    description: desc,
    openGraph: {
      title: event.title,
      description: desc,
      type: 'website',
      images: [{ url: ogUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: desc,
      images: [ogUrl],
    }
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  noStore(); // Interdit absolument le cache agressif de Vercel (evite les 404 fantomes)
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  let event = await getEventBySlug(params.slug);

  // Fallback si l'evenement n'est pas publie MAIS que c'est le proprietaire qui le regarde
  if (!event && user) {
    const { data } = await supabase.from('events').select('*').eq('slug', params.slug).eq('user_id', user.id).maybeSingle();
    if (data) event = data as typeof event;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">404</h1>
          <p className="text-gray-500">Cette page est introuvable ou n'est pas encore publique.</p>
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

  return <Invitation event={event} messages={messages} refParam={searchParams?.ref} />;
}
