// Helpers PayDunya (Checkout Invoice API).
// Doc : https://paydunya.com/developers

const MODE = process.env.PAYDUNYA_MODE || 'test';

export const PAYDUNYA_BASE =
  MODE === 'live'
    ? 'https://app.paydunya.com/api/v1'
    : 'https://app.paydunya.com/sandbox-api/v1';

export function paydunyaHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
    'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
    'PAYDUNYA-PUBLIC-KEY': process.env.PAYDUNYA_PUBLIC_KEY || '',
    'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || '',
  };
}

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

// Cree une facture de paiement et renvoie l'URL de checkout PayDunya.
export async function createInvoice(opts: {
  amount: number;
  description: string;
  itemName: string;
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
  customData?: Record<string, unknown>;
}): Promise<CreateInvoiceResult> {
  const payload = {
    invoice: {
      items: {
        item_0: {
          name: opts.itemName,
          quantity: 1,
          unit_price: String(opts.amount),
          total_price: String(opts.amount),
          description: opts.description,
        },
      },
      total_amount: opts.amount,
      description: opts.description,
    },
    store: { name: 'Festara' },
    custom_data: opts.customData || {},
    actions: {
      cancel_url: opts.cancelUrl,
      return_url: opts.returnUrl,
      callback_url: opts.callbackUrl,
    },
  };

  try {
    const res = await fetch(`${PAYDUNYA_BASE}/checkout-invoice/create`, {
      method: 'POST',
      headers: paydunyaHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.response_code === '00') {
      return { ok: true, token: data.token, url: data.response_text };
    }
    return { ok: false, error: data.response_text || 'Création facture échouée.' };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// Confirme l'etat d'une facture (statut : completed | cancelled | pending).
export async function confirmInvoice(token: string): Promise<{
  status: string;
  customData?: Record<string, any>;
}> {
  const res = await fetch(`${PAYDUNYA_BASE}/checkout-invoice/confirm/${token}`, {
    method: 'GET',
    headers: paydunyaHeaders(),
  });
  const data = await res.json();
  return { status: data.status, customData: data.custom_data };
}
