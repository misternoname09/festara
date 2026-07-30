import { NextResponse } from 'next/server';
import { createAdminClient, verifyEventAccess } from '@/lib/supabase/server';
import { createInvoice, PLANS } from '@/lib/naboopay';
import { calculateDiscount } from '@/lib/promo';

// POST /api/pay/naboopay  { event_id, plan, promoCode }
// Cree une transaction NabooPay pour l'achat d'un plan et renvoie l'URL de paiement.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { event_id, organization_id, plan, promoCode } = body || {};
  const planDef = PLANS[plan as string];
  
  if ((!event_id && !organization_id) || !planDef) {
    return NextResponse.json({ error: 'Identifiant ou plan invalide.' }, { status: 400 });
  }

  let user;
  let eventTitle = '';

  const admin = createAdminClient();

  try {
    if (event_id) {
      const access = await verifyEventAccess(event_id);
      user = access.user;
      const { data: ev } = await admin.from('events').select('title').eq('id', event_id).single();
      if (!ev) return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
      eventTitle = ev.title;
    } else {
      // Pour une agence
      const supabase = await import('@/lib/supabase/server').then(async m => await m.createServerSupabase());
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
      user = currentUser;
      const { data: org } = await admin.from('organizations').select('name').eq('id', organization_id).single();
      if (!org) return NextResponse.json({ error: 'Agence introuvable.' }, { status: 404 });
      eventTitle = org.name;
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Calcul du prix réduit si un code promo est fourni
  const { finalAmount, appliedPromo } = calculateDiscount(planDef.amount, promoCode);

  // Enregistre un paiement en attente
  const { data: pay } = await admin
    .from('payments')
    .insert({
      event_id: event_id || null,
      organization_id: organization_id || null,
      user_id: user.id,
      amount: finalAmount, // Montant réel à payer
      currency: 'XOF',
      provider: 'naboopay',
      status: 'pending',
    })
    .select('id')
    .single();

  const returnPath = event_id ? `/dashboard/${event_id}` : `/dashboard/agencies`;
  const description = appliedPromo
    ? `${planDef.label} — ${eventTitle} (Promo: -${appliedPromo.value}${appliedPromo.type === 'percent' ? '%' : ' FCFA'})`
    : `${planDef.label} — ${eventTitle}`;
  
  const invoice = await createInvoice({
    amount: finalAmount,
    itemName: planDef.label,
    description: description,
    returnUrl: `${site}${returnPath}?paid=1`,
    cancelUrl: `${site}${returnPath}?canceled=1`,
    callbackUrl: `${site}/api/pay/naboopay/callback`,
    customData: { event_id: event_id || '', organization_id: organization_id || '', plan, payment_id: pay?.id, promo: promoCode || '' },
  });

  if (!invoice.ok || !invoice.url) {
    return NextResponse.json({ error: invoice.error || 'Paiement indisponible.' }, { status: 502 });
  }

  // Memorise le token NabooPay pour reconciliation
  if (pay?.id) {
    await admin.from('payments').update({ provider_ref: invoice.token }).eq('id', pay.id);
  }

  return NextResponse.json({ url: invoice.url });
}
