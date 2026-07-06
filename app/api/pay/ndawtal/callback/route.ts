import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { confirmInvoice } from '@/lib/paydunya';

async function handle(token: string | null) {
  if (!token) return NextResponse.json({ error: 'token manquant' }, { status: 400 });

  // Verification auprès de PayDunya
  const { status, customData } = await confirmInvoice(token);
  
  if (!customData || !customData.contribution_id) {
    return NextResponse.json({ error: 'Missing contribution_id' }, { status: 400 });
  }

  const contributionId = customData.contribution_id;
  const admin = createAdminClient();

  if (status !== 'completed') {
    console.log(`Paiement Ndawtal non completé: ${status} pour ${contributionId}`);
    if (status === 'cancelled' || status === 'failed') {
      await admin.from('contributions').update({ status: 'failed' }).eq('id', contributionId);
    }
    return NextResponse.json({ success: true, note: 'Status not completed' });
  }

  // Le paiement est vérifié comme réussi par PayDunya
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
      provider_ref: token,
    })
    .eq('id', contributionId);

  if (updateError) {
    console.error('Erreur SQL Callback Ndawtal:', updateError);
    return NextResponse.json({ error: 'Erreur SQL' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  let token: string | null = null;
  const ctype = req.headers.get('content-type') || '';
  try {
    if (ctype.includes('application/json')) {
      const b = await req.json();
      token = b?.token || b?.data?.invoice?.token || null;
    } else {
      const form = await req.formData();
      token = (form.get('token') as string) || (form.get('data[invoice][token]') as string) || null;
    }
  } catch {
    /* ignore */
  }
  return handle(token);
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  return handle(token);
}
