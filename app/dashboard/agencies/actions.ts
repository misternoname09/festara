'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, createAdminClient } from '@/lib/supabase/server';

export async function createAgencyAction(formData: FormData) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autorisé');

  const name = String(formData.get('name') || '').trim();
  if (!name) throw new Error('Nom invalide');

  // Create organization
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({ name, owner_id: user.id })
    .select('id')
    .single();

  if (error || !org) {
    console.error("createAgencyAction err:", error);
    throw new Error('Impossible de créer l\'agence');
  }

  // Create owner member
  await supabase
    .from('organization_members')
    .insert({ organization_id: org.id, user_id: user.id, role: 'owner' });

  revalidatePath('/dashboard/agencies');
  return org.id;
}

export async function createInvitationAction(organizationId: string, email: string) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autorisé');

  email = email.trim().toLowerCase();
  if (!email) throw new Error('Email invalide');

  const { data, error } = await supabase
    .from('agency_invitations')
    .insert({ organization_id: organizationId, email })
    .select('token')
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      throw new Error('Une invitation pour cet email existe déjà.');
    }
    console.error("createInvitationAction err:", error);
    throw new Error('Impossible de créer l\'invitation.');
  }

  revalidatePath('/dashboard/agencies');
  return data.token;
}

export async function deleteInvitationAction(invitationId: string) {
  const supabase = createServerSupabase();
  await supabase.from('agency_invitations').delete().eq('id', invitationId);
  revalidatePath('/dashboard/agencies');
}

export async function removeMemberAction(organizationId: string, userId: string) {
  const supabase = createServerSupabase();
  await supabase.from('organization_members').delete().eq('organization_id', organizationId).eq('user_id', userId);
  revalidatePath('/dashboard/agencies');
}

export async function acceptInvitationAction(token: string) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Vous devez être connecté pour accepter une invitation.');

  const admin = createAdminClient();

  // Chercher l'invitation avec admin pour contourner le RLS (car l'utilisateur n'est pas encore membre)
  const { data: invite, error } = await admin
    .from('agency_invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !invite) throw new Error('Invitation invalide ou introuvable.');
  if (invite.accepted_at) throw new Error('Cette invitation a déjà été acceptée.');

  // Vérifier si l'utilisateur est bien celui invité ?
  // On peut forcer la correspondance de l'email, mais pour être souple, 
  // on accepte qu'il utilise le lien avec n'importe quel email, ou on peut le restreindre:
  if (user.email !== invite.email) {
    throw new Error(`Cette invitation est destinée à ${invite.email}. Veuillez vous connecter avec ce compte.`);
  }

  // Ajouter à organization_members
  const { error: memberError } = await admin
    .from('organization_members')
    .insert({
      organization_id: invite.organization_id,
      user_id: user.id,
      role: invite.role
    });
  
  if (memberError && memberError.code !== '23505') { // 23505 = unique_violation
    console.error('Erreur ajout membre:', memberError);
    throw new Error('Impossible de rejoindre l\'agence.');
  }

  // Marquer comme acceptée
  await admin
    .from('agency_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  revalidatePath('/dashboard/agencies');
}

export async function forceUpgradeAction(organizationId: string) {
  if (process.env.NODE_ENV !== 'development') throw new Error('Action non autorisée.');
  
  const admin = createAdminClient();
  await admin
    .from('organizations')
    .update({ plan: 'agency' })
    .eq('id', organizationId);
    
  revalidatePath('/dashboard/agencies');
}
