import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import ReflectionEditor from './reflectionEditor';

export const dynamic = 'force-dynamic';

type Entry = {
  id: string;
  slug: string;
  era: string;
  title: string;
  subtitle: string | null;
  context: string;
  question: string;
};

export default async function FoundationEntryPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect('/login');

  const slug = params.slug;

  // 1) Entry
  const { data: entry, error: entryErr } = await supabase
    .from('philosophy_entries')
    .select('id,slug,era,title,subtitle,context,question')
    .eq('slug', slug)
    .maybeSingle<Entry>();

  if (entryErr) throw new Error(entryErr.message);
  if (!entry) notFound();

  // 2) Excerpts (safe if none exist)
  const { data: excerpts, error: exErr } = await supabase
    .from('philosophy_excerpts')
    .select('id,source,excerpt')
    .eq('entry_id', entry.id)
    .order('created_at', { ascending: true });

  if (exErr) throw new Error(exErr.message);

  // 3) Reflection (optional)
  const { data: reflectionRow, error: reflErr } = await supabase
    .from('philosophy_reflections')
    .select('id,body')
    .eq('user_id', userData.user.id)
    .eq('entry_id', entry.id)
    .maybeSingle();

  if (reflErr) throw new Error(reflErr.message);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <Link href="/foundations" className="text-sm text-neutral-600 underline">
            Foundations
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{entry.title}</h1>
          {entry.subtitle ? (
            <p className="mt-2 text-sm text-neutral-600">{entry.subtitle}</p>
          ) : null}
        </div>

        <Link href="/today" className="text-sm text-neutral-700 underline">
          Today
        </Link>
      </header>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Context
        </div>
        <div className="prose prose-neutral mt-3 max-w-none">
          <p>{entry.context}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Primary text
        </div>

        {excerpts && excerpts.length > 0 ? (
          <div className="mt-4 space-y-5">
            {excerpts.map((ex: any) => (
              <figure
                key={ex.id}
                className="rounded-xl border border-neutral-100 bg-neutral-50 p-4"
              >
                <blockquote className="text-sm leading-relaxed text-neutral-800">
                  {ex.excerpt}
                </blockquote>
                <figcaption className="mt-3 text-xs text-neutral-500">
                  {ex.source}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-600">No excerpts added yet.</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Question
        </div>
        <p className="mt-3 text-base font-medium text-neutral-900">{entry.question}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Your reflection
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          Write like it’s private. Because it is.
        </p>

        <div className="mt-4">
          <ReflectionEditor entryId={entry.id} initialBody={reflectionRow?.body ?? ''} />
        </div>
      </section>
    </main>
  );
}
