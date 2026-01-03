import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { supabaseServer } from '@/lib/supabase-server';
import { pickDailyVirtue } from '@/lib/virtues';
import TodayForm from './todayForm';


export const dynamic = 'force-dynamic';


function isoDate(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export default async function TodayPage() {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) redirect('/login');

  const userId = userData.user.id;
  const todayISO = isoDate(new Date());

  // Fetch Compass (optional)
  const { data: compass } = await supabase
    .from('compass')
    .select('commitments')
    .eq('user_id', userId)
    .maybeSingle();

  const commitments = (compass?.commitments ?? []) as string[];

  // Fetch or create today's entry
  const { data: existing } = await supabase
    .from('daily_entries')
    .select('virtue,note,entry_date')
    .eq('user_id', userId)
    .eq('entry_date', todayISO)
    .maybeSingle();

  const virtue =
    existing?.virtue ??
    pickDailyVirtue({ userId, dateISO: todayISO, commitments });

  if (!existing) {
    await supabase.from('daily_entries').insert({
      user_id: userId,
      entry_date: todayISO,
      virtue,
      note: null,
    });
  }

  const note = existing?.note ?? '';

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Today</h1>
          <p className="mt-1 text-sm text-neutral-600">{format(new Date(), 'EEEE, MMM d')}</p>
        </div>
        <Link href="/week" className="text-sm font-medium text-neutral-700 underline">
          Weekly
        </Link>
      </header>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Today’s Virtue
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{virtue}</div>
        <p className="mt-3 text-sm text-neutral-700">
          Attend to moments where this virtue is demanded — especially where it is resisted.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="text-sm font-semibold">A note for your future self (optional)</div>
        <p className="mt-1 text-xs text-neutral-500">
          One sentence is enough. No performance. Just honesty.
        </p>

        <TodayForm dateISO={todayISO} initialNote={note} />
      </section>

      <footer className="mt-8 flex gap-3">
        <Link
          href="/compass"
          className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-center text-sm font-medium"
        >
          Compass
        </Link>
        <Link
          href="/week"
          className="flex-1 rounded-xl bg-black px-4 py-3 text-center text-sm font-medium text-white"
        >
          Weekly Examination
        </Link>

        <Link href="/foundations" className="underline text-sm font-medium text-neutral-700">
  Foundations
</Link>

      </footer>
    </main>
  );
}
