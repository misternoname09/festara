const GRAPH_BASE = 'https://graph.facebook.com';

// Envoie un message WhatsApp basé sur un template pré-approuvé par Meta.
// templateName : nom exact du template validé dans Meta Business Manager (ex: "festara_invitation_v1").
// languageCode : ex "fr" — doit correspondre à la langue du template approuvé.
// bodyParams : valeurs positionnelles insérées dans le template (ex: [nom_invite, url_pass]).
export async function sendWhatsAppTemplate(
  toPhone: string,
  templateName: string,
  languageCode: string,
  bodyParams: string[]
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const isDryRun = process.env.WHATSAPP_DRY_RUN === 'true';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const url = `${GRAPH_BASE}/${apiVersion}/${phoneNumberId}/messages`;

  const cleanPhone = toPhone.replace(/[^\d]/g, '');

  if (isDryRun) {
    console.log('[DRY RUN] WhatsApp Message:', {
      to: cleanPhone,
      template: templateName,
      params: bodyParams
    });
    return { ok: true, messageId: 'dry-run-' + Date.now() };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone, // format E.164 sans "+", ex: 221771234567
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: bodyParams.length
            ? [{
                type: 'body',
                parameters: bodyParams.map((p) => ({ type: 'text', text: p })),
              }]
            : [],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data?.error?.message || 'Erreur inconnue Meta API' };
    }
    return { ok: true, messageId: data?.messages?.[0]?.id };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
