'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-client';
import { getSupabaseHostPreview } from '@/lib/supabase-env';

export const dynamic = 'force-dynamic';

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: 'Authentication callback was missing the authorization code.',
  oauth: 'OAuth callback failed while exchanging session credentials.',
  invalid_config: 'Supabase environment configuration appears invalid.',
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const queryError = searchParams.get('e');
  const queryMessage = searchParams.get('m');
  const supabaseHost = useMemo(() => getSupabaseHostPreview(), []);

  async function signIn() {
    setError(null);
    setPending(true);

    try {
      const supabase = supabaseBrowser();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown sign-in error');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-neutral-600">Cicero is private. Your writing stays yours.</p>

      <button
        onClick={signIn}
        disabled={pending}
        className="mt-8 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? 'Opening Google…' : 'Continue with Google'}
      </button>

      {(queryError || queryMessage || error) ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <div className="font-semibold">Sign-in error</div>
          <p className="mt-1">
            {error ?? queryMessage ?? (queryError ? ERROR_MESSAGES[queryError] ?? 'Unknown authentication error.' : 'Unknown authentication error.')}
          </p>
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-600">
        <div className="font-semibold text-neutral-800">Supabase host in this deployment</div>
        <p className="mt-1 break-all">{supabaseHost ?? 'Unavailable (check NEXT_PUBLIC_SUPABASE_URL)'}</p>
      </div>
    </main>
  );
}
