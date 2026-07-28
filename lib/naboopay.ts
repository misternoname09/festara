// Helpers NabooPay (Checkout API).
// Doc : https://api.naboopay.com

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
  const url = 'https://api.naboopay.com/api/v2/transactions';
  
  // Tentative avec le payload standard (v1/v2 hybride)
  const payload = {
    method_of_payment: ["WAVE", "ORANGE_MONEY", "FREE_MONEY", "BANK"],
    products: [
      {
        name: opts.itemName,
        category: "service",
        amount: opts.amount,
        quantity: 1,
        description: opts.description,
      }
    ],
    success_url: opts.returnUrl,
    error_url: opts.cancelUrl,
    webhook_url: opts.callbackUrl,
    is_escrow: false,
    is_merchant_fee: false
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.NABOOPAY_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("NABOOPAY RAW RESPONSE:", data);

    if (res.ok && (data.checkout_url || data.data?.checkout_url)) {
      return { 
        ok: true, 
        token: data.transaction_id || data.id || data.data?.id || data.data?.transaction_id, 
        url: data.checkout_url || data.data?.checkout_url 
      };
    }
    
    return { ok: false, error: data.message || JSON.stringify(data) || 'Création facture échouée.' };
  } catch (e: any) {
    console.error("NABOOPAY ERROR", e);
    return { ok: false, error: e.message || 'Erreur inconnue' };
  }
}

// Confirme l'etat d'une facture.
export async function confirmInvoice(token: string): Promise<{
  status: string;
  customData?: Record<string, any>;
}> {
  try {
    const res = await fetch(`https://api.naboopay.com/api/v2/transactions/${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.NABOOPAY_API_KEY}`
      }
    });
    const data = await res.json();
    if (!res.ok) return { status: 'failed' };
    
    let status = data.status?.toLowerCase() || data.data?.status?.toLowerCase();
    if (status === 'success' || status === 'successful') status = 'completed';
    
    return { status: status, customData: data.metadata || data.custom_data || data.data?.metadata };
  } catch (e) {
    console.error("NABOOPAY CONFIRM ERROR", e);
    return { status: 'error' };
  }
}
