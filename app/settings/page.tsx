import { redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { requireUser } from '@/lib/cicero-data';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { user } = await requireUser();
  if (!user) redirect('/login');

  return (
    <AppShell title="Settings" subtitle="Account-level preferences are intentionally sparse.">
      <p className="text-sm text-neutral-700">Timezone and check-in time are stored in your profile when configured.</p>
    </AppShell>
  );
}
