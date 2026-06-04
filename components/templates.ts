import type { TemplateKind } from '@/lib/types';

// Configuration visuelle de chaque template. Tout est en CSS leger (pas d'images
// lourdes) pour tenir la contrainte < 150 Ko / 3G.
export interface TemplateStyle {
  name: string;
  page: string;       // fond de page
  card: string;       // carte centrale
  title: string;      // titre des maries
  accent: string;     // couleur d'accent (classe texte)
  divider: string;    // separateur decoratif (caractere)
  font: string;       // famille de police
}

export const TEMPLATES: Record<TemplateKind, TemplateStyle> = {
  wax: {
    name: 'Wax coloré',
    page: 'bg-[#7a1f2b]',
    card: 'bg-[#fff8ee] border-4 border-[#d9a441]',
    title: 'text-[#7a1f2b]',
    accent: 'text-[#c47e1a]',
    divider: '✦ ✦ ✦',
    font: 'font-serif',
  },
  arabic: {
    name: 'Calligraphie dorée',
    page: 'bg-[#0e1b2a]',
    card: 'bg-[#0e1b2a] border border-[#caa45a] text-[#f3e7c9]',
    title: 'text-[#d9bd7a]',
    accent: 'text-[#caa45a]',
    divider: '۞ ۞ ۞',
    font: 'font-serif',
  },
  modern: {
    name: 'Moderne minimaliste',
    page: 'bg-[#f4f4f2]',
    card: 'bg-white border border-black/10',
    title: 'text-[#1A2A4A]',
    accent: 'text-[#0E6B6B]',
    divider: '— · —',
    font: 'font-sans',
  },
};
