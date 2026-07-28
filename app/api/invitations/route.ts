import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// V11 : Whitelist des rôles autorisés
const ALLOWED_ROLES = ['viewer', 'editor', 'member', 'manager'];

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
    }

    const { target_type, target_id, role } = body;

    if (!target_type || !target_id || !role) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // V11 : Valider le rôle contre une whitelist
    if (typeof role !== 'string' || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: `Rôle invalide. Rôles autorisés : ${ALLOWED_ROLES.join(', ')}` }, { status: 400 });
    }

    if (target_type === 'event') {
      // Vérifier si l'utilisateur a accès à cet événement
      const { data: hasAccess } = await supabase.rpc('has_event_access', { evt_id: target_id, usr_id: user.id });
      if (!hasAccess) {
        return NextResponse.json({ error: 'Accès refusé à cet événement' }, { status: 403 });
      }

      // Créer l'invitation
      const { data: invitation, error } = await supabase
        .from('event_invitations')
        .insert({ event_id: target_id, role })
        .select('token')
        .single();

      if (error) {
        console.error('Erreur création invitation event:', error);
        return NextResponse.json({ error: 'Impossible de créer l\'invitation.' }, { status: 500 });
      }
      
      return NextResponse.json({ token: invitation.token });

    } else if (target_type === 'agency') {
      const { data: invitation, error } = await supabase
        .from('agency_invitations')
        .insert({ organization_id: target_id, role })
        .select('token')
        .single();

      if (error) {
        console.error('Erreur création invitation agence:', error);
        return NextResponse.json({ error: 'Impossible de créer l\'invitation.' }, { status: 500 });
      }
      
      return NextResponse.json({ token: invitation.token });

    } else {
      return NextResponse.json({ error: 'Type cible invalide' }, { status: 400 });
    }

  } catch (err: any) {
    console.error('Erreur API Invitations:', err);
    // V7 : Ne pas exposer les erreurs SQL internes
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}

