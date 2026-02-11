import { redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { requireUser } from '@/lib/cicero-data';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect('/login');

  const { data: rows } = await supabase
    .from('entry_scores')
    .select('score,user_virtue:user_virtues(custom_name,virtue:virtues(name,deficiency_label,excess_label))')
    .order('created_at', { ascending: true })
    .limit(300);

  const grouped = new Map<string, { values: number[]; deficiency?: string | null; excess?: string | null }>();

  for (const row of rows ?? []) {
    const uv = Array.isArray(row.user_virtue) ? row.user_virtue[0] : row.user_virtue;
    const virtueObj = uv && typeof uv === 'object' && 'virtue' in uv ? uv.virtue : null;
    const virtue = Array.isArray(virtueObj) ? virtueObj[0] : virtueObj;
    const name = (uv && 'custom_name' in uv ? uv.custom_name : null) ?? (virtue && 'name' in virtue ? virtue.name : 'Virtue');
    if (!grouped.has(name)) grouped.set(name, { values: [], deficiency: virtue?.deficiency_label, excess: virtue?.excess_label });
    grouped.get(name)!.values.push(row.score);
  }

  return (
    <AppShell title="Insights" subtitle="Longitudinal summaries of virtue practice.">
      <div className="space-y-4">
        {[...grouped.entries()].map(([name, data]) => {
          const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;
          const drift = avg < 2.6 ? `Toward deficiency (${data.deficiency ?? 'low expression'})` : avg > 3.8 ? `Toward excess (${data.excess ?? 'overextension'})` : 'Near mean';
          const points = data.values.slice(-20).map((score, index, arr) => {
            const x = arr.length <= 1 ? 0 : (index / (arr.length - 1)) * 200;
            const y = 60 - score * 10;
            return `${x},${y}`;
          }).join(' ');

          return (
            <div key={name} className="rounded border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{name}</div>
                <div className="text-sm text-neutral-600">Average {avg.toFixed(2)} / 5</div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">Drift: {drift}</div>
              <svg viewBox="0 0 200 60" className="mt-3 h-16 w-full rounded bg-neutral-50">
                <polyline fill="none" stroke="black" strokeWidth="2" points={points} />
              </svg>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
