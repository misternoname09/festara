import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { createInvoice, PLANS } from '@/lib/paydunya';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId, plan } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "ID de l'événement manquant" }, { status: 400 });
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

    // Déterminer le plan choisi (fallback sur 'essentiel')
    const selectedPlan = PLANS[plan] || PLANS.essentiel;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Utilise la fonction centralisée createInvoice() (respecte PAYDUNYA_MODE)
    const result = await createInvoice({
      amount: selectedPlan.amount,
      description: `Abonnement ${selectedPlan.label} — Événement: ${event.title}`,
      itemName: selectedPlan.label,
      returnUrl: `${siteUrl}/dashboard/${eventId}?payment=success`,
      cancelUrl: `${siteUrl}/dashboard/${eventId}`,
      callbackUrl: `${siteUrl}/api/pay/paydunya/callback`,
      customData: {
        event_id: eventId,
        user_id: user.id,
        plan: plan || 'essentiel',
      },
    });

    if (!result.ok) {
      console.error('Erreur PayDunya:', result.error);
      return NextResponse.json({ 
        error: result.error || "Erreur de création de la facture PayDunya. Vérifiez votre compte/KYC."
      }, { status: 500 });
    }

    // PayDunya renvoie l'URL vers laquelle rediriger le client pour payer
    return NextResponse.json({ paymentUrl: result.url });

  } catch (error: any) {
    console.error('Erreur serveur de paiement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
