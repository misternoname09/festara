import type { EventRow, Ceremony } from '@/lib/types';

// Event de demonstration (pour /i/demo, sans base de donnees)
export const DEMO_EVENT: EventRow = {
  id: 'demo',
  user_id: 'demo',
  slug: 'demo',
  title: 'Mariage Aïda & Modou',
  template: 'wax',
  welcome_message: "C'est avec une immense joie et beaucoup d'émotion que nous vous convions à célébrer l'union de nos deux familles. Votre présence à nos côtés en ce jour sacré sera notre plus beau cadeau. Venez partager avec nous ce moment d'amour, de prière et de tradition.",
  couple_photo_url: JSON.stringify([
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop"
  ]),
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

  const { createServerSupabase } = await import('@/lib/supabase/server');
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

