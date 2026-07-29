// Helpers NabooPay (Checkout API).
// Doc : https://docs.naboopay.com/api-reference/transactions
//
// ⚠️  IMPORTANT : NabooPay rejette les webhook_url non-publiques (localhost, 127.0.0.1).
//     En développement, le webhook est omis. En production, utiliser NEXT_PUBLIC_SITE_URL = https://...

// Plans Festara (FCFA)
export const PLANS: Record<string, { label: string; amount: number }> = {
  essentiel: { label: 'Festara Essentiel', amount: 15000 },
  premium: { label: 'Festara Premium', amount: 25000 },
  agence: { label: 'Festara Agence Pro', amount: 100000 },
};

export interface CreateInvoiceResult {
  ok: boolean;
  token?: string;
  url?: string;
  error?: string;
}

// Cree une transaction de paiement et renvoie l'URL de checkout NabooPay.
export async function createInvoice(opts: {
  amount: number;
  description: string;
  itemName: string;
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
  customData?: Record<string, unknown>;
}): Promise<CreateInvoiceResult> {
  const endpoint = 'https://api.naboopay.com/api/v2/transactions';
  const apiKey = process.env.NABOOPAY_API_KEY;

  if (!apiKey) {
    console.error('NABOOPAY_API_KEY manquant');
    return { ok: false, error: 'Clé API NabooPay non configurée.' };
  }

  // ⚠️ NabooPay rejette les webhook_url non-publiques (localhost, 127.0.0.1).
  // On omet le webhook en local — la confirmation se fera manuellement ou via polling.
  const isLocalCallback =
    opts.callbackUrl.includes('localhost') ||
    opts.callbackUrl.includes('127.0.0.1');

  const payload: Record<string, unknown> = {
    method_of_payment: ['WAVE', 'ORANGE_MONEY'],
    products: [
      {
        name: opts.itemName,
        category: 'service',
        amount: opts.amount,
        quantity: 1,
        description: opts.description,
      },
    ],
    success_url: opts.returnUrl,
    error_url: opts.cancelUrl,
    is_escrow: false,
    is_merchant_fee: false,
  };

  // Webhook seulement si l'URL est publique (HTTPS)
  if (!isLocalCallback) {
    payload.webhook_url = opts.callbackUrl;
  } else {
    console.warn('NABOOPAY: webhook_url omis (localhost non joignable par NabooPay)');
  }

  console.log('NABOOPAY PAYLOAD:', JSON.stringify(payload));

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(`NABOOPAY RESPONSE status=${res.status}:`, JSON.stringify(data));

    if (res.ok) {
      const checkoutUrl =
        data.checkout_url ||
        data.data?.checkout_url ||
        data.url ||
        data.payment_url;

      if (checkoutUrl) {
        return {
          ok: true,
          token:
            data.order_id ||
            data.transaction_id ||
            data.id ||
            data.data?.order_id ||
            data.data?.id,
          url: checkoutUrl,
        };
      }

      // Réponse 2xx mais sans URL de checkout
      console.error('NABOOPAY: réponse OK mais pas de checkout_url', data);
      return { ok: false, error: 'NabooPay: URL de paiement introuvable dans la réponse.' };
    }

    // Réponse d'erreur de NabooPay
    const errMsg: string =
      data?.detail ||
      data?.message ||
      data?.error ||
      JSON.stringify(data);

    console.error(`NABOOPAY ERREUR ${res.status}:`, errMsg);
    return { ok: false, error: `NabooPay (${res.status}): ${errMsg}` };
  } catch (e: any) {
    console.error('NABOOPAY NETWORK ERROR', e);
    return { ok: false, error: e.message || 'Erreur réseau NabooPay' };
  }
}


// Confirme l'etat d'une transaction NabooPay.
export async function confirmInvoice(token: string): Promise<{
  status: string;
  customData?: Record<string, any>;
}> {
  try {
    const res = await fetch(`https://api.naboopay.com/api/v2/transactions/${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.NABOOPAY_API_KEY}`,
      },
    });
    const data = await res.json();
    console.log('NABOOPAY CONFIRM:', JSON.stringify(data));
    if (!res.ok) return { status: 'failed' };

    // Normalisation du statut
    let status = (
      data.status ||
      data.data?.status ||
      data.transaction_status ||
      ''
    ).toLowerCase();

    if (['success', 'successful', 'paid', 'complete'].includes(status)) {
      status = 'completed';
    }

    return {
      status,
      customData: data.metadata || data.custom_data || data.data?.metadata,
    };
  } catch (e) {
    console.error('NABOOPAY CONFIRM ERROR', e);
    return { status: 'error' };
  }
}
