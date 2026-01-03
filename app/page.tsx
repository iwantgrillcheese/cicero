import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';


export default async function HomePage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  const authed = !!data.user;

  if (authed) {
    // If logged in, your life is on the line: go to Today.
    return (
      <main className="mx-auto max-w-md px-5 py-10">
        <h1 className="text-xl font-semibold tracking-tight">Cicero</h1>
        <p className="mt-3 text-sm text-neutral-600">
          A serious app for examining how you live.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/today"
            className="rounded-xl bg-black px-4 py-3 text-center text-sm font-medium text-white"
          >
            Enter
          </Link>
          <Link
            href="/week"
            className="rounded-xl border border-neutral-200 px-4 py-3 text-center text-sm font-medium"
          >
            Weekly Examination
          </Link>
          <Link
            href="/compass"
            className="rounded-xl border border-neutral-200 px-4 py-3 text-center text-sm font-medium"
          >
            Compass
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Cicero</h1>
      <p className="mt-3 text-sm text-neutral-600">
        A serious app for examining how you live.
      </p>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm text-neutral-700">
          Cicero is slow by design. It expects writing. It does not flatter you. It does not
          optimize you. It helps you see clearly.
        </p>

        <div className="mt-5">
          <Link
            href="/login"
            className="block rounded-xl bg-black px-4 py-3 text-center text-sm font-medium text-white"
          >
            Sign in with Google
          </Link>
        </div>
      </div>
    </main>
  );
}
