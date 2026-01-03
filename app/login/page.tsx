'use client';

import { supabase } from '@/lib/supabase-client';
export const dynamic = 'force-dynamic';


export default function LoginPage() {
  const signInWithGoogle = async () => {
    const origin = window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Cicero
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        Sign in to continue.
      </p>

      <button
        onClick={signInWithGoogle}
        className="mt-8 w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        Continue with Google
      </button>
    </main>
  );
}
