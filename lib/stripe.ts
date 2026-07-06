import Stripe from 'stripe';

// Client Stripe (serveur uniquement).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

// Plans diaspora en EUR (montants en CENTIMES).
export const PLANS_EUR: Record<string, { label: string; amount: number }> = {
  essentiel: { label: 'Festara Essentiel', amount: 2500 }, // 25,00 €
  premium: { label: 'Festara Premium', amount: 4000 }, // 40,00 €
  agence: { label: 'Festara Agence Pro', amount: 15000 }, // 150,00 €
};
