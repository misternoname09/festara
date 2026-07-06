'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, verifyEventAccess } from '@/lib/supabase/server';

export async function addBudgetItemAction(
  eventId: string,
  category: string,
  plannedAmount: number,
  actualAmount: number,
  notes?: string
) {
  const { supabase } = await verifyEventAccess(eventId);

  const { data: item, error } = await supabase.from('budget_items').insert({
    event_id: eventId,
    category: category.trim(),
    planned_amount: Math.max(0, plannedAmount),
    actual_amount: Math.max(0, actualAmount),
    notes: notes?.trim() || null,
  }).select().single();

  if (error || !item) {
    console.error("addBudgetItemAction error:", error);
    throw new Error("Erreur lors de l'ajout du poste budgétaire.");
  }

  revalidatePath(`/dashboard/${eventId}`);
  return item;
}

export async function updateBudgetItemAction(
  eventId: string,
  itemId: string,
  plannedAmount: number,
  actualAmount: number,
  notes?: string
) {
  const { supabase } = await verifyEventAccess(eventId);

  const { error } = await supabase
    .from('budget_items')
    .update({
      planned_amount: Math.max(0, plannedAmount),
      actual_amount: Math.max(0, actualAmount),
      notes: notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('event_id', eventId);

  if (error) {
    console.error("updateBudgetItemAction error:", error);
    throw new Error("Erreur lors de la mise à jour du poste budgétaire.");
  }

  revalidatePath(`/dashboard/${eventId}`);
  return true;
}

export async function deleteBudgetItemAction(eventId: string, itemId: string) {
  const { supabase } = await verifyEventAccess(eventId);

  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', itemId)
    .eq('event_id', eventId);

  if (error) {
    console.error("deleteBudgetItemAction error:", error);
    throw new Error("Erreur lors de la suppression du poste budgétaire.");
  }

  revalidatePath(`/dashboard/${eventId}`);
  return true;
}
