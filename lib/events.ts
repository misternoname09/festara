import { createServerSupabase } from '@/lib/supabase/server';
import type { EventRow, Ceremony } from '@/lib/types';

// Event de demonstration (pour /i/demo, sans base de donnees)
export const DEMO_EVENT: EventRow = {
  id: 'demo',
  user_id: 'demo',
  slug: 'demo',
  title: 'Mariage Aïda & Modou',
  template: 'wax',
  couple_photo_url: null,
  ceremonies: [
    {
      id: 'takk',
      name: 'Takk Dieul (cérémonie religieuse)',
      date: '2026-12-19',
      time: '11:00',
      location: 'Grande Mosquée, Dakar',
      maps_url: 'Grande Mosquée Dakar',
    },
    {
      id: 'keureum',
      name: 'Keureum (la soirée)',
      date: '2026-12-19',
      time: '21:00',
      location: 'King Fahd Palace, Dakar',
      maps_url: 'King Fahd Palace Dakar',
    },
  ],
  theme_colors: { primary: '#1A2A4A', accent: '#B68A35' },
  plan: 'premium',
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Recupere une invitation PUBLIEE par son slug. Renvoie null si introuvable.
export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  if (slug === 'demo') return DEMO_EVENT;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) return null;
  return data as EventRow;
}

// Construit l'URL d'embed Google Maps sans cle API (iframe leger).
export function mapsEmbedUrl(c: Ceremony): string {
  const q = encodeURIComponent(c.maps_url || c.location);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

// Formatage date FR court (ex: "vendredi 19 décembre 2026")
export function formatDateFr(iso: string): string {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
