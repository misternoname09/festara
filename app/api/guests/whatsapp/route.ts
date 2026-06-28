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

    if (!guest_id) {
      return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
    }

    // Mettre à jour whatsapp_sent
    const { error } = await supabase
      .from('guests')
      .update({ whatsapp_sent: true })
      .eq('id', guest_id);

    if (error) {
      console.error("Erreur update whatsapp_sent:", error);
      return NextResponse.json({ error: 'Erreur SQL.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur WhatsApp API:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
