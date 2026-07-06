import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Echange le code du lien magique (email) contre une session, puis redirige.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const rawNext = url.searchParams.get('next') || '/dashboard';

  // Sécurité : n'autoriser que des chemins internes relatifs (jamais une URL absolue
  // ni une URL "protocol-relative" comme //evil.com), pour éviter un open redirect.
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//')
    ? rawNext
    : '/dashboard';

  if (code) {
    const supabase = createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
