import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // PayDunya envoie le hash du token de facture (ici appele "token" ou "invoice_token" selon leur version)
    // Le plus simple et securise est de recuperer le payload complet, lire le status, et le custom_data.
    const body = await req.text();
    if (!body) return NextResponse.json({ error: 'Body vide' }, { status: 400 });

    const payload = JSON.parse(body);

    const status = payload.status; // "completed", "cancelled", etc.
    const customData = payload.custom_data;
    
    if (!customData || !customData.contribution_id) {
      return NextResponse.json({ error: 'Missing contribution_id' }, { status: 400 });
    }

    const contributionId = customData.contribution_id;

    if (status !== 'completed') {
      console.log(`Paiement Ndawtal non completé: ${status} pour ${contributionId}`);
      // On peut marquer comme failed si ce n'est pas "pending"
      if (status === 'cancelled' || status === 'failed') {
        const admin = createAdminClient();
        await admin.from('contributions').update({ status: 'failed' }).eq('id', contributionId);
      }
      return NextResponse.json({ success: true, note: 'Status not completed' });
    }

    // Le paiement est réussi
    const admin = createAdminClient();

    // Verification pour eviter le double traitement
    const { data: contrib } = await admin
      .from('contributions')
      .select('status')
      .eq('id', contributionId)
      .single();

    if (!contrib || contrib.status === 'confirmed') {
      return NextResponse.json({ success: true, note: 'Already confirmed or not found' });
    }

    // Mise a jour
    const { error: updateError } = await admin
      .from('contributions')
      .update({
        status: 'confirmed',
        provider_ref: payload.invoice?.token || null, // Token de facture pour reference
      })
      .eq('id', contributionId);

    if (updateError) {
      console.error('Erreur SQL Callback Ndawtal:', updateError);
      return NextResponse.json({ error: 'Erreur SQL' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur Callback Ndawtal:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
