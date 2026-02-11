import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { requireUser } from '@/lib/cicero-data';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect('/login');

  const { data: entries } = await supabase
    .from('daily_entries')
    .select('entry_date, acted_well, fell_short, rationalized, correction')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(60);

  return (
    <AppShell title="History" subtitle="Past entries and reflections.">
      <div className="space-y-2">
        {(entries ?? []).map((entry) => (
          <Link key={entry.entry_date} href={`/history/${entry.entry_date}`} className="block rounded border border-neutral-200 p-3 hover:bg-neutral-50">
            <div className="font-medium">{entry.entry_date}</div>
            <p className="text-xs text-neutral-600">{entry.acted_well || entry.fell_short || 'No reflection text yet.'}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
