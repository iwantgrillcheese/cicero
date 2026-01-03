'use client';

import { supabaseBrowser } from '@/lib/supabase-client';

export default function LoginPage() {
  async function signIn() {
    const supabase = supabaseBrowser();
    const redirectTo = `${window.location.origin}/auth/callback`;


    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  }

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Cicero is private. Your writing stays yours.
      </p>

      <button
        onClick={signIn}
        className="mt-8 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
      >
        Continue with Google
      </button>
    </main>
  );
}
