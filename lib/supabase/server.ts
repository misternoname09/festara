// Clients Supabase cote SERVEUR.
// - createServerClient : respecte la session / RLS (lecture publique, dashboard).
// - createAdminClient  : service_role, BYPASS RLS. A n'utiliser QUE dans des
//   routes serveur de confiance (RSVP anonyme, webhooks paiement). Jamais expose au client.
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appele depuis un Server Component : ignorable si un middleware rafraichit la session.
          }
        },
      },
    }
  );
}

// Acces administrateur — BYPASS RLS. Ne jamais importer dans un Client Component.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
