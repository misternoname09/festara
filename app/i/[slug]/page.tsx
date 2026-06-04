import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

export default async function InvitationPage({ params }: Props) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();
  return <Invitation event={event} />;
}
