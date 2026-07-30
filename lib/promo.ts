export type PromoCode = {
  code: string;
  type: 'percent' | 'fixed';
  value: number; // For 'percent' (e.g. 20 for 20%)
  isActive: boolean;
};

// Les codes promo actifs
export const PROMO_CODES: Record<string, PromoCode> = {
  'LANCEMENT20': { code: 'LANCEMENT20', type: 'percent', value: 20, isActive: true },
  'BETA50': { code: 'BETA50', type: 'percent', value: 50, isActive: true },
};

/**
 * Calcule le nouveau montant en fonction du code promo (s'il est valide).
 * @param originalAmount Le montant de base (en centimes EUR, ou FCFA)
 * @param promoCode Le code promo saisi
 * @returns { finalAmount, discountAmount, appliedPromo } 
 */
export function calculateDiscount(originalAmount: number, promoCode?: string) {
  if (!promoCode) {
    return { finalAmount: originalAmount, discountAmount: 0, appliedPromo: null };
  }

  const code = promoCode.toUpperCase().trim();
  const promo = PROMO_CODES[code];

  if (!promo || !promo.isActive) {
    return { finalAmount: originalAmount, discountAmount: 0, appliedPromo: null };
  }

  let finalAmount = originalAmount;
  if (promo.type === 'percent') {
    // on garde le résultat entier (cents ou fcfa)
    finalAmount = Math.round(originalAmount * (1 - (promo.value / 100)));
  } else if (promo.type === 'fixed') {
    finalAmount = Math.max(0, originalAmount - promo.value);
  }

  return {
    finalAmount,
    discountAmount: originalAmount - finalAmount,
    appliedPromo: promo
  };
}
