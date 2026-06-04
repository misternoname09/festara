'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import type { Ceremony } from '@/lib/types';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
}

// Cree une nouvelle invitation (brouillon) et redirige vers son edition.
export async function createEvent(formData: FormData) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const title = String(formData.get('title') || '').trim();
  if (!title) return;

  const base = slugify(title) || 'mariage';
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await supabase
    .from('events')
    .insert({ user_id: user.id, title, slug, template: 'modern' })
    .select('id')
    .single();

  if (error || !data) return;
  redirect(`/dashboard/${data.id}`);
}

// Met a jour une invitation (titre, template, ceremonies, publication).
export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const title = String(formData.get('title') || '').trim();
  const template = String(formData.get('template') || 'modern');
  const is_published = formData.get('is_published') === 'on';

  // Ceremonies : champs indexes name_i / date_i / time_i / location_i
  const ceremonies: Ceremony[] = [];
  for (let i = 0; i < 6; i++) {
    const name = String(formData.get(`name_${i}`) || '').trim();
    if (!name) continue;
    ceremonies.push({
      id: String(formData.get(`cid_${i}`) || `c${i}`),
      name,
      date: String(formData.get(`date_${i}`) || ''),
      time: String(formData.get(`time_${i}`) || ''),
      location: String(formData.get(`location_${i}`) || '').trim(),
      maps_url: String(formData.get(`location_${i}`) || '').trim(),
    });
  }

  const { error } = await supabase
    .from('events')
    .update({ title, template, ceremonies, is_published })
    .eq('id', eventId)
    .eq('user_id', user.id);

  if (error) return;
  revalidatePath(`/dashboard/${eventId}`);
  revalidatePath('/dashboard');
}

export async function signOut() {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect('/login');
}
