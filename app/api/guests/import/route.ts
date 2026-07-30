import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { event_id, guests } = await req.json();

    if (!event_id || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    // V9 : Limiter le nombre d'invités par import pour éviter le DoS
    if (guests.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 invités par import.' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est propriétaire de l'événement et récupérer le plan
    const { data: ev, error: evError } = await supabase
      .from('events')
      .select('id, ceremonies, plan')
      .eq('id', event_id)
      .eq('user_id', user.id)
      .single();

    if (evError || !ev) {
      return NextResponse.json({ error: 'Accès refusé ou événement introuvable.' }, { status: 403 });
    }

    // Vérification de la limite du plan Essentiel (200 invités max)
    if (ev.plan === 'essentiel') {
      const { count } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id);

      const currentCount = count || 0;
      if (currentCount + guests.length > 200) {
        return NextResponse.json({ 
          error: `Le Plan Essentiel est limité à 200 invités. Vous en avez déjà ${currentCount}. Veuillez passer au Plan Premium.` 
        }, { status: 403 });
      }
    }

    // Tous les invités importés sont invités à toutes les cérémonies par défaut
    const allCeremonyIds = ev.ceremonies.map((c: any) => c.id);

    // Préparation des lignes à insérer
    // V9 : Valider chaque invité
    const rowsToInsert = guests
      .filter((g: any) => g && typeof g.name === 'string' && g.name.trim().length > 0)
      .map((g: any) => ({
        event_id,
        first_name: g.name.trim().slice(0, 100),
        phone: (typeof g.phone === 'string' && g.phone.trim()) ? g.phone.trim().slice(0, 20) : null,
        party_size: 1,
        ceremonies_attending: allCeremonyIds,
        rsvp_confirmed_at: new Date().toISOString(),
        whatsapp_sent: false,
      }));

    if (rowsToInsert.length === 0) {
      return NextResponse.json({ error: 'Aucun invité valide trouvé.' }, { status: 400 });
    }

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
