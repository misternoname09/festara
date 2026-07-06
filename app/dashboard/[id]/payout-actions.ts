'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, createAdminClient, verifyEventAccess } from '@/lib/supabase/server';
import { getAvailableBalance } from '@/lib/balance';

export async function requestPayoutAction(eventId: string, amount: number, bankDetails: string) {
  const { user } = await verifyEventAccess(eventId);

  // Vérifie que le montant demandé ne dépasse pas le solde disponible
  const available = await getAvailableBalance(eventId);
  if (amount > available) {
    throw new Error(`Solde insuffisant. Disponible : ${available} FCFA.`);
  }
  if (amount <= 0) throw new Error('Montant invalide.');
  if (!bankDetails.trim()) throw new Error('Coordonnées de paiement requises.');

  const admin = createAdminClient();
  const { error } = await admin.from('payouts').insert({
    user_id: user.id,
    event_id: eventId,
    amount,
    bank_details: bankDetails.trim(),
    status: 'pending',
  });
  
  if (error) {
    console.error("requestPayoutAction error:", error);
    throw new Error("Erreur lors de la création de la demande de reversement.");
  }

  revalidatePath(`/dashboard/${eventId}`);
  return true;
}
