import type { TemplateKind } from '@/lib/types';

// Configuration visuelle premium de chaque template.
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
    name: 'Wax coloré (Premium)',
    page: 'bg-[#4A1525]',
    card: 'bg-[#FDFBF7] border-[6px] border-[#C59A45] shadow-2xl',
    title: 'text-[#4A1525] font-serif',
    accent: 'text-[#C59A45] font-bold',
    divider: '✦ ✦ ✦',
    font: 'font-serif',
  },
  arabic: {
    name: 'Calligraphie dorée',
    page: 'bg-[#0A1226]',
    card: 'bg-[#0A1226] border border-[#C59A45]/40 shadow-[0_20px_50px_rgba(197,154,69,0.1)] text-[#F9F6F0]',
    title: 'text-[#DFB769] font-serif tracking-wide',
    accent: 'text-[#C59A45]',
    divider: '۞ ۞ ۞',
    font: 'font-serif',
  },
  modern: {
    name: 'Moderne minimaliste',
    page: 'bg-[#F9F6F0]',
    card: 'bg-white/80 backdrop-blur-md border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    title: 'text-[#0A1226] font-serif',
    accent: 'text-[#0B5959]',
    divider: '— · —',
    font: 'font-sans',
  },
};
