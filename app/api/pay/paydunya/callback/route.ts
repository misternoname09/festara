import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { confirmInvoice, PLANS } from '@/lib/paydunya';

// IPN PayDunya — appele par PayDunya apres tentative de paiement.
// On NE fait JAMAIS confiance au corps recu : on re-verifie via confirmInvoice.
async function handle(token: string | null) {
  if (!token) return NextResponse.json({ error: 'token manquant' }, { status: 400 });

  const { status, customData } = await confirmInvoice(token);
  const admin = createAdminClient();

  const newStatus = status === 'completed' ? 'confirmed' : status === 'cancelled' ? 'failed' : 'pending';

  // Met a jour le paiement par son token (provider_ref)
  await admin
    .from('payments')
    .update({
      status: newStatus,
      paid_at: newStatus === 'confirmed' ? new Date().toISOString() : null,
    })
    .eq('provider_ref', token);

  // Si paye : applique le plan a l'evenement
  if (newStatus === 'confirmed' && customData?.event_id && PLANS[customData.plan]) {
    await admin
      .from('events')
      .update({ plan: customData.plan, is_published: true })
      .eq('id', customData.event_id);
  }

  return NextResponse.json({ received: true, status: newStatus });
}

// PayDunya envoie en POST (form-urlencoded) ; on gere aussi GET pour les tests.
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
