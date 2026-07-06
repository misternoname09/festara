// Festara — types TypeScript des tables Supabase

export type TemplateKind = 'wax' | 'arabic' | 'modern';
export type PaymentProvider = 'paydunya' | 'cinetpay' | 'stripe' | 'wave';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed';
export type PlanKind = 'gratuit' | 'essentiel' | 'premium' | 'pro';

export interface Ceremony {
  id: string;          // identifiant local (ex: "takk", "keureum")
  name: string;        // ex: "Takk Dieul"
  date: string;        // ISO yyyy-mm-dd
  time?: string;       // ex: "16:00"
  location: string;
  maps_url?: string;
}

export interface ThemeColors {
  primary: string;
  accent: string;
}

export interface EventRow {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  template: TemplateKind;
  welcome_message: string | null;
  couple_photo_url: string | null;
  ceremonies: Ceremony[];
  theme_colors: ThemeColors;
  plan: PlanKind;
  is_published: boolean;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestRow {
  id: string;
  event_id: string;
  first_name: string;
  phone?: string | null;
  whatsapp_sent: boolean;
  party_size: number;
  ceremonies_attending: string[];
  pass_code: string;
  pass_uuid: string;
  rsvp_confirmed_at: string | null;
  scanned_at: string | null;
  checked_in_count: number;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  event_id: string;
  user_id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  provider_ref: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface ContributionRow {
  id: string;
  event_id: string;
  guest_id: string | null;
  author_name: string;
  amount: number;
  fee: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  provider_ref: string | null;
  message: string | null;
  created_at: string;
}

export interface EventStats {
  event_id: string;
  guests_total: number;
  guests_confirmed: number;
  people_confirmed: number;
  guests_scanned: number;
}

export interface GuestbookMessageRow {
  id: string;
  event_id: string;
  author_name: string;
  message: string;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  planned_amount: number;
  actual_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
