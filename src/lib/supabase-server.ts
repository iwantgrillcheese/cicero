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
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
