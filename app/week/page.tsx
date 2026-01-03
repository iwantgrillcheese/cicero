import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format, startOfWeek } from 'date-fns';
import { supabaseServer } from '@/lib/supabase-server';
import WeeklyForm from './weeklyForm';

export const dynamic = 'force-dynamic';


function isoDate(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export default async function WeekPage() {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect('/login');

  const userId = userData.user.id;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekStartISO = isoDate(weekStart);

  // Pull virtues from last 7 daily entries (or current week)
  const { data: daily } = await supabase
    .from('daily_entries')
    .select('virtue, entry_date')
    .eq('user_id', userId)
    .gte('entry_date', weekStartISO)
    .order('entry_date', { ascending: true });

  const virtues = Array.from(new Set((daily ?? []).map((d) => d.virtue)));

  const { data: existing } = await supabase
    .from('weekly_reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStartISO)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Weekly Examination</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Week of {format(weekStart, 'MMM d')}
          </p>
        </div>
        <Link href="/today" className="text-sm font-medium text-neutral-700 underline">
          Today
        </Link>
      </header>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="text-sm font-semibold">Before you write</div>
        <p className="mt-2 text-sm text-neutral-700">
          Sit down. Write carefully. No performance. No excuses. This is for truth.
        </p>

        {virtues.length > 0 ? (
          <p className="mt-4 text-xs text-neutral-500">
            This week’s virtues: <span className="text-neutral-800">{virtues.join(', ')}</span>
          </p>
        ) : (
          <p className="mt-4 text-xs text-neutral-500">
            No daily virtues recorded this week. That is not “bad.” It is information.
          </p>
        )}
      </section>

      <section className="mt-6">
        <WeeklyForm weekStartISO={weekStartISO} initial={existing} virtues={virtues} />
      </section>

      <footer className="mt-8 text-xs text-neutral-500">
        If nothing changes, this is the life you are choosing.
      </footer>
    </main>
  );
}
