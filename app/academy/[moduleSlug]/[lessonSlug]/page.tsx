import { notFound, redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { getAcademyModules, getLessonProgress, getLessonsForModule, requireUser } from '@/lib/cicero-data';
import LessonProgressButton from './lesson-progress-button';

export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }: { params: Promise<{ moduleSlug: string; lessonSlug: string }> }) {
  const { moduleSlug, lessonSlug } = await params;
  const { user } = await requireUser();
  if (!user) redirect('/login');

  const modules = await getAcademyModules();
  const moduleRecord = modules.find((item) => item.slug === moduleSlug);
  if (!moduleRecord) notFound();

  const lessons = await getLessonsForModule(moduleRecord.id);
  const lesson = lessons.find((item) => item.slug === lessonSlug);
  if (!lesson) notFound();

  const progress = await getLessonProgress(user.id);

  return (
    <AppShell title={lesson.title} subtitle={moduleRecord.title}>
      <article className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Summary</h2>
          <p className="mt-2 text-sm leading-7 text-neutral-700">{lesson.summary}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Key Arguments</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-neutral-700">
            {lesson.key_arguments.map((arg) => <li key={arg}>{arg}</li>)}
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Objections / Tensions</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-neutral-700">
            {lesson.objections.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Key Terms</h2>
          <ul className="mt-2 space-y-2 text-sm text-neutral-700">
            {lesson.key_terms.map((item) => (
              <li key={item.term}><span className="font-medium">{item.term}:</span> {item.definition}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">References</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-neutral-700">
            {lesson.references_text.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <LessonProgressButton lessonId={lesson.id} initiallyCompleted={progress.has(lesson.id)} />
      </article>
    </AppShell>
  );
}
