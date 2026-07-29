'use server';

import { createServerSupabase, createAdminClient } from '@/lib/supabase/server';
import { sendWhatsAppTemplate } from '@/lib/whatsapp';

export async function sendGuestPassViaWhatsApp(guestId: string) {
  try {
    const supabase = await createServerSupabase();
    // Validate auth (only event owner or agency can trigger this)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    // Retrieve the guest and the event details
    // We use adminClient because RLS might be tricky, or just standard server client
    const { data: guest, error } = await supabase
      .from('guests')
      .select('*, events(title, slug)')
      .eq('id', guestId)
      .single();

    if (error || !guest) {
      throw new Error("Invité introuvable");
    }

    if (!guest.phone) {
      throw new Error("Cet invité n'a pas de numéro de téléphone enregistré.");
    }

    const event = guest.events as any;
    
    // Construct the public URL for the Pass
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const passUrl = `${appUrl}/pass/${guest.pass_uuid}`;
    
    // The variables mapped to the template
    // Template ex: "festara_invitation" (Hello {{1}}, voici ton pass pour {{2}}. Lien: {{3}})
    const params = [
      guest.first_name,
      event.title,
      passUrl
    ];

    const result = await sendWhatsAppTemplate(
      guest.phone,
      'festara_invitation',
      'fr',
      params
    );

    if (!result.ok) {
      console.error("Erreur lors de l'envoi WhatsApp:", result.error);
      throw new Error(result.error || "Erreur Meta API");
    }

    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("Action sendGuestPassViaWhatsApp error:", error);
    return { success: false, error: error.message };
  }
}
