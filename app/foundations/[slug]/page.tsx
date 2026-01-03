import Link from 'next/link';
import { notFound } from 'next/navigation';
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

type Excerpt = {
  id: string;
  source: string;
  excerpt: string;
  order_index: number;
};

export default async function EntryPage({ params }: { params: { slug: string } }) {
  const supabase = await supabaseServer();

  const { data: entry } = await supabase
    .from('philosophy_entries')
    .select('id,slug,era,title,subtitle,context,question')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!entry) return notFound();

  const { data: excerpts } = await supabase
    .from('philosophy_excerpts')
    .select('id,source,excerpt,order_index')
    .eq('entry_id', (entry as Entry).id)
    .order('order_index', { ascending: true });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let reflectionBody = '';
  if (user) {
    const { data: reflection } = await supabase
      .from('philosophy_reflections')
      .select('body')
      .eq('user_id', user.id)
      .eq('entry_id', (entry as Entry).id)
      .maybeSingle();

    reflectionBody = reflection?.body ?? '';
  }

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <Link href="/foundations" className="text-sm font-medium text-neutral-700 underline">
            Foundations
          </Link>
          <h1 className="mt-3 text-xl font-semibold tracking-tight">{(entry as Entry).title}</h1>
          {(entry as Entry).subtitle ? (
            <p className="mt-2 text-sm text-neutral-600">{(entry as Entry).subtitle}</p>
          ) : null}
        </div>
        <Link href="/today" className="text-sm font-medium text-neutral-700 underline">
          Today
        </Link>
      </header>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Context
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-800">
          {(entry as Entry).context}
        </p>
      </section>

      <section className="mt-6 space-y-3">
        {(excerpts as Excerpt[] | null)?.map((ex) => (
          <div key={ex.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Primary text
            </div>
            <div className="mt-2 text-xs text-neutral-500">{ex.source}</div>
            <blockquote className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-900">
              “{ex.excerpt}”
            </blockquote>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Question
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-900">{(entry as Entry).question}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="text-sm font-semibold">Your notes (private)</div>
        <p className="mt-1 text-xs text-neutral-500">
          This is for you. Write plainly. Save if you want.
        </p>

        {user ? (
          <ReflectionEditor entryId={(entry as Entry).id} initialBody={reflectionBody} />
        ) : (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            Sign in to save notes. You can still read everything.
            <div className="mt-3">
              <Link href="/login" className="font-medium underline">
                Sign in
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
