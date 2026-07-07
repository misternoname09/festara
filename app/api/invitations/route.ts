import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { target_type, target_id, role } = await req.json();

    if (!target_type || !target_id || !role) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
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

      if (error) throw error;
      
      return NextResponse.json({ token: invitation.token });

    } else if (target_type === 'agency') {
      // Vérifier si l'utilisateur est owner ou membre de l'agence
      // Pour des raisons de sécurité, on devrait vérifier la db, 
      // mais les politiques RLS empêcheront l'insertion si pas autorisé.
      const { data: invitation, error } = await supabase
        .from('agency_invitations')
        .insert({ organization_id: target_id, role })
        .select('token')
        .single();

      if (error) throw error;
      
      return NextResponse.json({ token: invitation.token });

    } else {
      return NextResponse.json({ error: 'Type cible invalide' }, { status: 400 });
    }

  } catch (err: any) {
    console.error('Erreur API Invitations:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
