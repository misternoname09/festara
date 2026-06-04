import { createServerSupabase } from '@/lib/supabase/server';
import type { GuestRow } from '@/lib/types';

// GET /api/export/[eventId]
// Renvoie la liste des invites en CSV (pour le traiteur). Reserve au proprietaire (RLS).
export async function GET(_req: Request, { params }: { params: { eventId: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response('Non autorisé', { status: 401 });

  // RLS : ne renvoie que si l'utilisateur possede l'evenement.
  const { data: ev } = await supabase
    .from('events')
    .select('id, title, slug')
    .eq('id', params.eventId)
    .maybeSingle();
  if (!ev) return new Response('Accès refusé', { status: 403 });

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', params.eventId)
    .order('created_at', { ascending: true });

  const rows = (guests as GuestRow[] | null) ?? [];

  const esc = (v: unknown) => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = [
    'Prenom',
    'Nb personnes',
    'Ceremonies',
    'Code pass',
    'RSVP confirme le',
    'Scanne le',
  ];

  const lines = rows.map((g) =>
    [
      esc(g.first_name),
      g.party_size,
      esc((g.ceremonies_attending || []).join(' | ')),
      g.pass_code,
      g.rsvp_confirmed_at ? new Date(g.rsvp_confirmed_at).toLocaleString('fr-FR') : '',
      g.scanned_at ? new Date(g.scanned_at).toLocaleString('fr-FR') : '',
    ].join(',')
  );

  // BOM UTF-8 pour Excel (accents corrects)
  const csv = '﻿' + [header.join(','), ...lines].join('\n');
  const filename = `invites-${ev.slug}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
