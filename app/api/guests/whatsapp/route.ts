import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { guest_id } = await req.json();

    if (!guest_id || typeof guest_id !== 'string') {
      return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
    }

    // V2 : Vérifier que le guest appartient à un événement de l'utilisateur courant
    // RLS sur la table guests filtre par event_id, et RLS sur events filtre par user_id.
    // On utilise le client authentifié (pas admin) pour que RLS fasse le travail.
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, event_id')
      .eq('id', guest_id)
      .maybeSingle();

    if (guestError || !guest) {
      return NextResponse.json({ error: 'Invité introuvable ou accès refusé.' }, { status: 403 });
    }

    // Mettre à jour whatsapp_sent (RLS garantit que seul le propriétaire peut update)
    const { error } = await supabase
      .from('guests')
      .update({ whatsapp_sent: true })
      .eq('id', guest_id);

    if (error) {
      console.error("Erreur update whatsapp_sent:", error);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur WhatsApp API:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

