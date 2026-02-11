import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { getAcademyModules, requireUser } from '@/lib/cicero-data';

export const dynamic = 'force-dynamic';

export default async function AcademyPage() {
  const { user } = await requireUser();
  if (!user) redirect('/login');

  const modules = await getAcademyModules();

  return (
    <AppShell title="Academy" subtitle="Structured study in virtue ethics.">
      <div className="space-y-4">
        {modules.map((module) => (
          <Link key={module.id} href={`/academy/${module.slug}`} className="block rounded-lg border border-neutral-200 p-5 hover:bg-neutral-50">
            <h2 className="font-medium">{module.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{module.summary}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
