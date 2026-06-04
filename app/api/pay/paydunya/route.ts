import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminClient } from '@/lib/supabase/server';
import { createInvoice, PLANS } from '@/lib/paydunya';

// POST /api/pay/paydunya  { event_id, plan }
// Cree une facture PayDunya pour l'achat d'un plan et renvoie l'URL de paiement.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { event_id, plan } = body || {};
  const planDef = PLANS[plan as string];
  if (!event_id || !planDef) {
    return NextResponse.json({ error: 'Plan ou événement invalide.' }, { status: 400 });
  }

  // Auth : seul le proprietaire paie pour son evenement.
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

  // Enregistre un paiement en attente
  const { data: pay } = await admin
    .from('payments')
    .insert({
      event_id,
      user_id: user.id,
      amount: planDef.amount,
      currency: 'XOF',
      provider: 'paydunya',
      status: 'pending',
    })
    .select('id')
    .single();

  const invoice = await createInvoice({
    amount: planDef.amount,
    itemName: planDef.label,
    description: `${planDef.label} — ${ev.title}`,
    returnUrl: `${site}/dashboard/${event_id}?paid=1`,
    cancelUrl: `${site}/dashboard/${event_id}?canceled=1`,
    callbackUrl: `${site}/api/pay/paydunya/callback`,
    customData: { event_id, plan, payment_id: pay?.id },
  });

  if (!invoice.ok || !invoice.url) {
    return NextResponse.json({ error: invoice.error || 'Paiement indisponible.' }, { status: 502 });
  }

  // Memorise le token PayDunya pour reconciliation
  if (pay?.id) {
    await admin.from('payments').update({ provider_ref: invoice.token }).eq('id', pay.id);
  }

  return NextResponse.json({ url: invoice.url });
}
