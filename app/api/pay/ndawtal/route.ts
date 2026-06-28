import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createInvoice } from '@/lib/paydunya';

export async function POST(req: Request) {
  try {
    const { event_id, amount, author_name, message } = await req.json();

    if (!event_id || !amount || amount < 1000 || !author_name) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verifier l'evenement
    const { data: ev, error: evError } = await admin
      .from('events')
      .select('slug, title')
      .eq('id', event_id)
      .single();

    if (evError || !ev) {
      return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/i/${ev.slug}?ndawtal=success`;
    const cancelUrl = `${baseUrl}/i/${ev.slug}?ndawtal=cancel`;
    const callbackUrl = `${baseUrl}/api/pay/ndawtal/callback`;

    // 1. Inserer la contribution (statut = pending)
    const { data: contrib, error: insertError } = await admin
      .from('contributions')
      .insert({
        event_id,
        author_name: author_name.trim(),
        message: message ? message.trim() : null,
        amount,
        fee: Math.round(amount * 0.05), // ex: 5% de frais Festara
        provider: 'paydunya',
        status: 'pending'
      })
      .select('id')
      .single();

    if (insertError || !contrib) {
      console.error('Erreur insertion contribution:', insertError);
      return NextResponse.json({ error: 'Erreur SQL.' }, { status: 500 });
    }

    // 2. Creer la facture PayDunya
    const invoice = await createInvoice({
      amount,
      itemName: `Cadeau pour ${ev.title}`,
      description: `Cadeau de la part de ${author_name}`,
      returnUrl,
      cancelUrl,
      callbackUrl,
      customData: {
        contribution_id: contrib.id,
      },
    });

    if (!invoice.ok) {
      return NextResponse.json({ error: invoice.error }, { status: 400 });
    }

    return NextResponse.json({ url: invoice.url });
  } catch (error) {
    console.error('Erreur API Ndawtal:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
