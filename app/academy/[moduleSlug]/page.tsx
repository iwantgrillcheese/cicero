import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { getAcademyModules, getLessonProgress, getLessonsForModule, requireUser } from '@/lib/cicero-data';

export const dynamic = 'force-dynamic';

export default async function ModulePage({ params }: { params: Promise<{ moduleSlug: string }> }) {
  const { moduleSlug } = await params;
  const { user } = await requireUser();
  if (!user) redirect('/login');

  const modules = await getAcademyModules();
  const moduleRecord = modules.find((item) => item.slug === moduleSlug);
  if (!moduleRecord) notFound();

  const lessons = await getLessonsForModule(moduleRecord.id);
  const progress = await getLessonProgress(user.id);

  return (
    <AppShell title={moduleRecord.title} subtitle={moduleRecord.summary}>
      <div className="space-y-3">
        {lessons.map((lesson) => {
          const complete = progress.has(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/academy/${moduleRecord.slug}/${lesson.slug}`}
              className="flex items-start justify-between rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50"
            >
              <div>
                <h2 className="font-medium">{lesson.title}</h2>
                <p className="mt-1 text-sm text-neutral-600">{lesson.summary}</p>
              </div>
              <span className="text-xs text-neutral-500">{complete ? 'Completed' : 'Open'}</span>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
