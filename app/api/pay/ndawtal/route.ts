import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createInvoice } from '@/lib/paydunya';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const MAX_AMOUNT = 5_000_000; // 5M XOF max

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
    }

    const { event_id, amount, author_name, message } = body;

    if (!event_id || !amount || !author_name) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    // V4 : Validation stricte des entrées
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount < 1000 || parsedAmount > MAX_AMOUNT) {
      return NextResponse.json({ error: `Le montant doit être entre 1 000 et ${MAX_AMOUNT.toLocaleString('fr')} XOF.` }, { status: 400 });
    }

    if (typeof author_name !== 'string' || author_name.trim().length === 0 || author_name.length > 100) {
      return NextResponse.json({ error: 'Nom invalide (max 100 caractères).' }, { status: 400 });
    }

    if (message && (typeof message !== 'string' || message.length > 500)) {
      return NextResponse.json({ error: 'Message trop long (max 500 caractères).' }, { status: 400 });
    }

    // V4 : Rate-limiting par IP
    const ip = getClientIp(req);
    const { ok } = rateLimit(`ndawtal:${ip}`, 5, 10 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
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
        author_name: author_name.trim().slice(0, 100),
        message: message ? message.trim().slice(0, 500) : null,
        amount: parsedAmount,
        fee: Math.round(parsedAmount * 0.05), // ex: 5% de frais Festara
        provider: 'paydunya',
        status: 'pending'
      })
      .select('id')
      .single();

    if (insertError || !contrib) {
      console.error('Erreur insertion contribution:', insertError);
      return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 });
    }

    // 2. Creer la facture PayDunya
    const invoice = await createInvoice({
      amount: parsedAmount,
      itemName: `Cadeau pour ${ev.title}`,
      description: `Cadeau de la part de ${author_name.trim().slice(0, 100)}`,
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

