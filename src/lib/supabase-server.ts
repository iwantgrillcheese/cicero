import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getServerSupabaseAnonKey, getServerSupabaseUrl } from '@/lib/supabase-env';

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(getServerSupabaseUrl(), getServerSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components, Next.js forbids mutating cookies directly.
        // Supabase may still attempt refresh writes on auth reads; ignore those here.
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // No-op: cookie writes belong in Route Handlers, Server Actions, or proxy.
          }
        });
      },
    },
  });
}
