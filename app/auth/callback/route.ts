import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Echange le code du lien magique (email) contre une session, puis redirige.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
