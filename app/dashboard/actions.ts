'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabase, verifyEventAccess } from '@/lib/supabase/server';
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

  // Vérifier la limite de 25 événements
  const { count } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (count !== null && count >= 25) {
    throw new Error("Vous avez atteint la limite maximale de 25 événements.");
  }

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
  const { supabase, user } = await verifyEventAccess(eventId);

  const title = String(formData.get('title') || '').trim();
  const template = String(formData.get('template') || 'modern');
  let is_published = formData.get('is_published') === 'on';

  const organization_id = String(formData.get('organization_id') || '').trim() || null;

  // Fix #6 : Valider que l'organization_id appartient bien à l'utilisateur (RLS filtre déjà)
  let orgPlan = null;
  if (organization_id) {
    const { data: org } = await supabase.from('organizations').select('id, plan').eq('id', organization_id).single();
    if (!org) {
      // L'utilisateur n'a pas accès à cette organisation (RLS bloque)
      throw new Error('Organisation introuvable ou accès refusé.');
    }
    orgPlan = org.plan;
  }
  
  const { data: ev } = await supabase.from('events').select('plan').eq('id', eventId).single();
  const isFreePlan = ev?.plan === 'gratuit' && orgPlan !== 'agency';

  if (isFreePlan) {
    is_published = false;
  }

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

  const welcome_message = String(formData.get('welcome_message') || '').trim() || null;

  const { error } = await supabase
    .from('events')
    .update({ title, template, ceremonies, is_published, welcome_message, organization_id })
    .eq('id', eventId);

  if (error) {
    console.error("Erreur lors de la mise à jour de l'événement:", error);
    throw new Error(error.message);
  }
  
  revalidatePath(`/dashboard/${eventId}`);
  revalidatePath('/dashboard');
}

export async function signOut() {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function createEventInvitationAction(eventId: string, role: string) {
  const { supabase, user } = await verifyEventAccess(eventId);
  
  const { data, error } = await supabase
    .from('event_invitations')
    .insert({ event_id: eventId, role })
    .select('token')
    .single();

  if (error || !data) {
    console.error("createEventInvitationAction err:", error);
    throw new Error('Impossible de créer l\'invitation.');
  }

  revalidatePath(`/dashboard/${eventId}`);
  return data.token;
}

export async function deleteEventInvitationAction(invitationId: string) {
  const supabase = createServerSupabase();
  // TODO: RLS ensures you can only delete if you have access to the event
  await supabase.from('event_invitations').delete().eq('id', invitationId);
  // Can't reliably revalidate path without knowing eventId, but we can do a generic approach or assume it works
}

export async function removeEventCollaboratorAction(eventId: string, userId: string) {
  const { supabase } = await verifyEventAccess(eventId);
  await supabase.from('event_collaborators').delete().eq('event_id', eventId).eq('user_id', userId);
  revalidatePath(`/dashboard/${eventId}`);
}
