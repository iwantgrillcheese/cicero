import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type EntryRow = {
  id: string;
  slug: string;
  era: string;
  order_index: number;
  title: string;
  subtitle: string | null;
};

export default async function FoundationsIndexPage() {
  const supabase = await supabaseServer();

  const { data: entries, error } = await supabase
    .from('philosophy_entries')
    .select('id,slug,era,order_index,title,subtitle')
    .order('era', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    return (
      <main className="mx-auto max-w-md px-5 py-10">
        <h1 className="text-xl font-semibold tracking-tight">Foundations</h1>
        <p className="mt-4 text-sm text-red-600">Error loading entries: {error.message}</p>
      </main>
    );
  }

  const grouped = (entries as EntryRow[]).reduce<Record<string, EntryRow[]>>((acc, e) => {
    acc[e.era] = acc[e.era] ?? [];
    acc[e.era].push(e);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Foundations</h1>
          <p className="mt-2 text-sm text-neutral-600">
            A library of serious attempts to answer how to live.
          </p>
        </div>
        <Link href="/today" className="text-sm font-medium text-neutral-700 underline">
          Today
        </Link>
      </header>

      <div className="mt-8 space-y-8">
        {Object.entries(grouped).map(([era, eraEntries]) => (
          <section key={era}>
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {era}
            </div>

            <div className="mt-3 space-y-3">
              {eraEntries.map((e) => (
                <Link
                  key={e.id}
                  href={`/foundations/${e.slug}`}
                  className="block rounded-2xl border border-neutral-200 bg-white p-5 hover:bg-neutral-50"
                >
                  <div className="text-sm font-semibold text-neutral-900">{e.title}</div>
                  {e.subtitle ? (
                    <div className="mt-1 text-sm text-neutral-600">{e.subtitle}</div>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
