import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client public (Browser / Client Components)
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

// Client Admin (Server-side, bypass RLS Supabase — pour auth admin uniquement)
export function createSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Client SSR (Server Components / Server Actions)
// À adapter avec @supabase/ssr pour la gestion des cookies
export function createSupabaseServer(cookieStore: {
  get: (name: string) => { value: string } | undefined;
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
  delete: (name: string) => void;
}) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      // Gestion des cookies pour SSR — à implémenter selon @supabase/ssr
    },
  });
}
