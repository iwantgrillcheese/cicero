import { notFound, redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { requireUser } from '@/lib/cicero-data';

export const dynamic = 'force-dynamic';

export default async function HistoryDetail({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const { supabase, user } = await requireUser();
  if (!user) redirect('/login');

  const { data: entry } = await supabase
    .from('daily_entries')
    .select('id,entry_date,acted_well,fell_short,rationalized,correction')
    .eq('user_id', user.id)
    .eq('entry_date', date)
    .maybeSingle();

  if (!entry) notFound();

  const { data: scores } = await supabase
    .from('entry_scores')
    .select('score,note,user_virtue:user_virtues(custom_name,virtue:virtues(name))')
    .eq('entry_id', entry.id);

  return (
    <AppShell title={`Entry: ${entry.entry_date}`}>
      <div className="space-y-4 text-sm text-neutral-700">
        <p><span className="font-medium">Acted well:</span> {entry.acted_well || '—'}</p>
        <p><span className="font-medium">Fell short:</span> {entry.fell_short || '—'}</p>
        <p><span className="font-medium">Rationalized:</span> {entry.rationalized || '—'}</p>
        <p><span className="font-medium">Correction:</span> {entry.correction || '—'}</p>
        <div>
          <h2 className="font-medium">Virtue Scores</h2>
          <ul className="mt-2 space-y-2">
            {(scores ?? []).map((row, index) => {
              const nested = Array.isArray(row.user_virtue) ? row.user_virtue[0] : row.user_virtue;
              const virtueObj = nested && typeof nested === 'object' && 'virtue' in nested ? nested.virtue : null;
              const virtue = Array.isArray(virtueObj) ? virtueObj[0] : virtueObj;
              const name = (nested && 'custom_name' in nested ? nested.custom_name : null) ?? (virtue && typeof virtue === 'object' && 'name' in virtue ? virtue.name : 'Virtue');
              return <li key={index}>{name}: {row.score}/5 {row.note ? `— ${row.note}` : ''}</li>;
            })}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
