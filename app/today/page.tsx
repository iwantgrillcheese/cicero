import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { requireUser, toISODate } from '@/lib/cicero-data';
import TodayForm from './today-form';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect('/login');

  const dateISO = toISODate(new Date());

  const [{ data: entry }, { data: virtues }] = await Promise.all([
    supabase.from('daily_entries').select('*').eq('user_id', user.id).eq('entry_date', dateISO).maybeSingle(),
    supabase
      .from('user_virtues')
      .select('id,custom_name,virtue:virtues(name),is_archived')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('sort_order'),
  ]);

  const entryId = entry?.id;
  const { data: scores } = entryId
    ? await supabase.from('entry_scores').select('user_virtue_id,score,note').eq('entry_id', entryId)
    : { data: [] as { user_virtue_id: string; score: number | null; note: string | null }[] };

  const mapped = Object.fromEntries((scores ?? []).map((row) => [row.user_virtue_id, { score: row.score, note: row.note }]));

  const items = (virtues ?? []).map((item) => ({
    userVirtueId: item.id,
    name: item.custom_name ?? (Array.isArray(item.virtue) ? item.virtue[0]?.name : (item.virtue as { name?: string } | null)?.name) ?? 'Virtue',
    initialScore: null,
    initialNote: '',
  }));

  return (
    <AppShell title="Today" subtitle={format(new Date(), 'EEEE, MMM d')}>
      <p className="mb-4 text-sm text-neutral-600">2–4 minutes. Score each active virtue and complete a short reflection.</p>
      <TodayForm dateISO={dateISO} virtues={items} initial={mapped} />
    </AppShell>
  );
}
