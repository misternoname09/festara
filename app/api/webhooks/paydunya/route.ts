import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // PayDunya envoie le statut du paiement à cette URL en arrière-plan
    const body = await req.json();
    
    // Le hash est utilisé par PayDunya pour certifier la provenance
    // body.data contiendra les détails de la transaction
    const transactionStatus = body.data?.status;
    const customData = body.data?.custom_data;
    const amount = body.data?.invoice?.total_amount;

    if (transactionStatus === 'completed' && customData?.event_id) {
      // Le paiement est réussi !
      // On passe en bypass RLS car ce webhook n'est pas authentifié avec un token utilisateur
      const supabase = createServerSupabase(); // Admin privileges ou contournement nécessaire si RLS est actif
      
      // Attention : Comme RLS bloque les modifications sans session utilisateur, 
      // il faudrait idéalement utiliser un client supabase avec le role SERVICE_ROLE
      // Ici nous allons utiliser process.env.SUPABASE_SERVICE_ROLE_KEY
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 1. Mettre à jour l'événement : passe en 'premium' et 'is_published = true'
      const { error: eventError } = await supabaseAdmin
        .from('events')
        .update({ 
          plan: 'premium',
          is_published: true 
        })
        .eq('id', customData.event_id);

      if (eventError) {
        console.error("Erreur mise à jour event webhook:", eventError);
        return NextResponse.json({ status: 'error' }, { status: 500 });
      }

      // 2. Enregistrer la trace du paiement dans la table payments
      await supabaseAdmin.from('payments').insert({
        event_id: customData.event_id,
        user_id: customData.user_id,
        amount: amount,
        currency: 'XOF',
        provider: 'paydunya',
        status: 'confirmed',
        provider_ref: body.data.token,
        paid_at: new Date().toISOString()
      });

      console.log(`Paiement réussi pour l'événement ${customData.event_id} !`);
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error: any) {
    console.error('Erreur Webhook PayDunya:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
