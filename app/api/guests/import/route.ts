import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { event_id, guests } = await req.json();

    if (!event_id || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est propriétaire de l'événement
    const { data: ev, error: evError } = await supabase
      .from('events')
      .select('id, ceremonies')
      .eq('id', event_id)
      .eq('user_id', user.id)
      .single();

    if (evError || !ev) {
      return NextResponse.json({ error: 'Accès refusé ou événement introuvable.' }, { status: 403 });
    }

    // Tous les invités importés sont invités à toutes les cérémonies par défaut
    const allCeremonyIds = ev.ceremonies.map((c: any) => c.id);

    // Préparation des lignes à insérer
    const rowsToInsert = guests.map((g: any) => ({
      event_id,
      first_name: g.name.trim(),
      phone: g.phone ? g.phone.trim() : null,
      party_size: 1, // Par défaut 1 personne
      ceremonies_attending: allCeremonyIds,
      // rsvp_confirmed_at: on le met à jour pour dire que c'est l'hôte qui les a invités directement
      rsvp_confirmed_at: new Date().toISOString(),
      whatsapp_sent: false,
    }));

    // Insertion en masse
    const { error: insertError } = await supabase
      .from('guests')
      .insert(rowsToInsert);

    if (insertError) {
      console.error("Erreur d'importation de masse:", insertError);
      return NextResponse.json({ error: 'Impossible de sauvegarder la liste.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: rowsToInsert.length });
  } catch (error: any) {
    console.error('Erreur import API:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
