import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: 'ID de l\'événement manquant' }, { status: 400 });
    }

    // On vérifie que l'événement appartient bien à l'utilisateur
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, plan')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    if (event.plan !== 'gratuit') {
      return NextResponse.json({ error: 'Cet événement est déjà débloqué' }, { status: 400 });
    }

    // Récupération des clés PayDunya depuis l'environnement
    const mode = process.env.PAYDUNYA_MODE || 'test';
    const masterKey = process.env.PAYDUNYA_MASTER_KEY;
    const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
    const token = process.env.PAYDUNYA_TOKEN;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (!masterKey || !privateKey || !token) {
      return NextResponse.json({ error: 'Configuration PayDunya manquante sur le serveur' }, { status: 500 });
    }

    // Appel à l'API de PayDunya pour créer une facture (Checkout Invoice)
    const response = await fetch('https://app.paydunya.com/api/v1/checkout-invoice/create', {
      method: 'POST',
      headers: {
        'PAYDUNYA-MASTER-KEY': masterKey,
        'PAYDUNYA-PRIVATE-KEY': privateKey,
        'PAYDUNYA-TOKEN': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice: {
          total_amount: 15000,
          description: `Abonnement Premium Festara - Événement: ${event.title}`,
        },
        store: {
          name: 'Festara',
          website_url: siteUrl,
        },
        actions: {
          cancel_url: `${siteUrl}/dashboard/${eventId}`,
          return_url: `${siteUrl}/dashboard/${eventId}?payment=success`,
          callback_url: `${siteUrl}/api/pay/paydunya/callback`,
        },
        custom_data: {
          event_id: eventId,
          user_id: user.id,
        },
      }),
    });

    const data = await response.json();

    if (data.response_code !== '00') {
      console.error('Erreur PayDunya:', data);
      return NextResponse.json({ 
        error: data.response_text || "Erreur de création de la facture PayDunya. Vérifiez votre compte/KYC."
      }, { status: 500 });
    }

    // PayDunya renvoie l'URL vers laquelle rediriger le client pour payer
    return NextResponse.json({ paymentUrl: data.response_text });

  } catch (error: any) {
    console.error('Erreur serveur de paiement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
