import { createAdminClient } from '@/lib/supabase/server';

// Calcule le solde disponible d'un utilisateur pour un événement donné :
// somme des paiements confirmés + contributions confirmées, moins la commission Festara,
// moins les payouts déjà traités ou en attente (pour ne pas compter deux fois le même argent).
export async function getAvailableBalance(eventId: string): Promise<number> {
  const admin = createAdminClient();

  const { data: contributions } = await admin
    .from('contributions')
    .select('amount, fee')
    .eq('event_id', eventId)
    .eq('status', 'confirmed');

  const totalContributions = (contributions || []).reduce(
    (sum, c) => sum + (c.amount - c.fee), 0
  );

  const { data: payouts } = await admin
    .from('payouts')
    .select('amount, status')
    .eq('event_id', eventId)
    .in('status', ['pending', 'processed']);

  const totalPayouts = (payouts || []).reduce((sum, p) => sum + p.amount, 0);

  return Math.max(0, totalContributions - totalPayouts);
}
