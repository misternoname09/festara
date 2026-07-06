import { NextResponse } from 'next/server';
import { stripe, PLANS_EUR } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';

// Webhook Stripe — signature verifiee avec STRIPE_WEBHOOK_SECRET.
// Requiert le corps BRUT : on lit req.text().
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 });
  }

  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e: any) {
    return NextResponse.json({ error: `Signature invalide: ${e.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const admin = createAdminClient();

    await admin
      .from('payments')
      .update({ status: 'confirmed', paid_at: new Date().toISOString() })
      .eq('provider_ref', session.id);

    const meta = session.metadata || {};
    if (PLANS_EUR[meta.plan]) {
      if (meta.event_id) {
        await admin.from('events').update({ plan: meta.plan }).eq('id', meta.event_id);
      } else if (meta.organization_id) {
        await admin.from('organizations').update({ plan: 'agency' }).eq('id', meta.organization_id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
