import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminClient } from '@/lib/supabase/server';
import { stripe, PLANS_EUR } from '@/lib/stripe';

// POST /api/pay/stripe  { event_id, plan }
// Cree une session Stripe Checkout (carte internationale, diaspora).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { event_id, plan } = body || {};
  const planDef = PLANS_EUR[plan as string];
  if (!event_id || !planDef) {
    return NextResponse.json({ error: 'Plan ou événement invalide.' }, { status: 400 });
  }

  const authed = createServerSupabase();
  const {
    data: { user },
  } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  const admin = createAdminClient();
  const { data: ev } = await admin
    .from('events')
    .select('id, user_id, title')
    .eq('id', event_id)
    .maybeSingle();
  if (!ev || ev.user_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data: pay } = await admin
    .from('payments')
    .insert({
      event_id,
      user_id: user.id,
      amount: planDef.amount,
      currency: 'EUR',
      provider: 'stripe',
      status: 'pending',
    })
    .select('id')
    .single();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: `${planDef.label} — ${ev.title}` },
            unit_amount: planDef.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${site}/dashboard/${event_id}?paid=1`,
      cancel_url: `${site}/dashboard/${event_id}?canceled=1`,
      metadata: { event_id, plan, payment_id: pay?.id ?? '' },
    });

    if (pay?.id) {
      await admin.from('payments').update({ provider_ref: session.id }).eq('id', pay.id);
    }
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Stripe indisponible.' }, { status: 502 });
  }
}
