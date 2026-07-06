import { NextResponse } from 'next/server';
import { createAdminClient, verifyEventAccess } from '@/lib/supabase/server';
import { stripe, PLANS_EUR } from '@/lib/stripe';

// POST /api/pay/stripe  { event_id, plan }
// Cree une session Stripe Checkout (carte internationale, diaspora).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { event_id, organization_id, plan } = body || {};
  const planDef = PLANS_EUR[plan as string];
  
  if ((!event_id && !organization_id) || !planDef) {
    return NextResponse.json({ error: 'Identifiant ou plan invalide.' }, { status: 400 });
  }

  let user;
  let eventTitle = '';

  try {
    const admin = createAdminClient();
    
    if (event_id) {
      const access = await verifyEventAccess(event_id);
      user = access.user;
      const { data: ev } = await admin.from('events').select('title').eq('id', event_id).single();
      if (!ev) return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
      eventTitle = ev.title;
    } else {
      // Pour une agence
      const supabase = await import('@/lib/supabase/server').then(m => m.createServerSupabase());
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
      user = currentUser;
      user = currentUser;
      const { data: org } = await admin.from('organizations').select('name').eq('id', organization_id).single();
      if (!org) return NextResponse.json({ error: 'Agence introuvable.' }, { status: 404 });
      eventTitle = org.name;
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }

  const admin = createAdminClient();

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data: pay } = await admin
    .from('payments')
    .insert({
      event_id: event_id || null,
      organization_id: organization_id || null,
      user_id: user.id,
      amount: planDef.amount,
      currency: 'EUR',
      provider: 'stripe',
      status: 'pending',
    })
    .select('id')
    .single();

  const returnPath = event_id ? `/dashboard/${event_id}` : `/dashboard/agencies`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: `${planDef.label} — ${eventTitle}` },
            unit_amount: planDef.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${site}${returnPath}?paid=1`,
      cancel_url: `${site}${returnPath}?canceled=1`,
      metadata: { event_id: event_id || '', organization_id: organization_id || '', plan, payment_id: pay?.id ?? '' },
    });

    if (pay?.id) {
      await admin.from('payments').update({ provider_ref: session.id }).eq('id', pay.id);
    }
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Stripe indisponible.' }, { status: 502 });
  }
}
