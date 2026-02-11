import { redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { getWeekStartISO, requireUser } from '@/lib/cicero-data';
import WeeklyReviewForm from './weekly-form';

export const dynamic = 'force-dynamic';

export default async function WeeklyReviewPage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect('/login');

  const weekStart = getWeekStartISO();

  const [{ data: review }, { data: entries }, { data: virtues }] = await Promise.all([
    supabase.from('weekly_reviews').select('*').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle(),
    supabase.from('daily_entries').select('id').eq('user_id', user.id).gte('entry_date', weekStart),
    supabase.from('user_virtues').select('id,custom_name,virtue:virtues(name)').eq('user_id', user.id).eq('is_archived', false).order('sort_order'),
  ]);

  const entryIds = (entries ?? []).map((entry) => entry.id);
  const { data: scores } = entryIds.length
    ? await supabase.from('entry_scores').select('score,user_virtue_id').in('entry_id', entryIds)
    : { data: [] as { score: number; user_virtue_id: string }[] };

  const consistency = entryIds.length;
  const averages = Object.values(
    (scores ?? []).reduce<Record<string, { sum: number; count: number }>>((acc, row) => {
      if (!acc[row.user_virtue_id]) acc[row.user_virtue_id] = { sum: 0, count: 0 };
      acc[row.user_virtue_id].sum += row.score;
      acc[row.user_virtue_id].count += 1;
      return acc;
    }, {})
  ).map((value) => value.sum / value.count);
  const weekAverage = averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;

  const virtueOptions = (virtues ?? []).map((item) => {
    const nested = Array.isArray(item.virtue) ? item.virtue[0] : item.virtue;
    return { id: item.id, label: item.custom_name ?? (nested?.name ?? 'Virtue') };
  });

  return (
    <AppShell title="Weekly Review" subtitle={`Week starting ${weekStart}`}>
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <div className="rounded border border-neutral-200 p-3 text-sm">Consistency: {consistency} daily entries</div>
        <div className="rounded border border-neutral-200 p-3 text-sm">Average alignment: {weekAverage.toFixed(2)} / 5</div>
      </div>
      <WeeklyReviewForm weekStart={weekStart} virtues={virtueOptions} initial={review} />
    </AppShell>
  );
}
