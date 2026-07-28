import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { confirmInvoice, PLANS } from '@/lib/naboopay';

// IPN NabooPay — appele par NabooPay apres tentative de paiement.
// On verifie l'etat final via confirmInvoice pour plus de securite.
async function handle(token: string | null) {
  if (!token) return NextResponse.json({ error: 'token manquant' }, { status: 400 });

  const { status, customData } = await confirmInvoice(token);
  const admin = createAdminClient();

  const newStatus = status === 'completed' ? 'confirmed' : status === 'failed' ? 'failed' : 'pending';

  // Met a jour le paiement par son token (provider_ref)
  await admin
    .from('payments')
    .update({
      status: newStatus,
      paid_at: newStatus === 'confirmed' ? new Date().toISOString() : null,
    })
    .eq('provider_ref', token);

  // Si paye : applique le plan a l'evenement ou a l'agence
  if (newStatus === 'confirmed' && PLANS[customData?.plan]) {
    if (customData?.event_id) {
      await admin
        .from('events')
        .update({ plan: customData.plan, is_published: true })
        .eq('id', customData.event_id);
    } else if (customData?.organization_id) {
      await admin
        .from('organizations')
        .update({ plan: 'agency' })
        .eq('id', customData.organization_id);
    }
  }

  return NextResponse.json({ received: true, status: newStatus });
}

export async function POST(req: Request) {
  let token: string | null = null;
  const ctype = req.headers.get('content-type') || '';
  try {
    if (ctype.includes('application/json')) {
      const b = await req.json();
      // Adjust according to the actual webhook payload from Naboopay
      token = b?.transaction_id || b?.id || b?.data?.id || null; 
    }
  } catch {
    /* ignore */
  }
  return handle(token);
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('transaction_id') || new URL(req.url).searchParams.get('id');
  return handle(token);
}
