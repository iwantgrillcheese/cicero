import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import CompassForm from './compassForm';

export const dynamic = 'force-dynamic';


export default async function CompassPage() {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect('/login');

  const { data } = await supabase
    .from('compass')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Compass</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Define what you mean by “not wasting your life.”
          </p>
        </div>
        <Link href="/today" className="text-sm font-medium text-neutral-700 underline">
          Today
        </Link>
      </header>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm text-neutral-700">
          Cicero cannot tell you how to live. But it can keep you honest about whether you are living
          in alignment with what you claim matters.
        </p>
      </section>

      <section className="mt-6">
        <CompassForm initial={data} />
      </section>
    </main>
  );
}
