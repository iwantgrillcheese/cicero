import { redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { requireUser } from '@/lib/cicero-data';
import CodeManager from './code-manager';

export const dynamic = 'force-dynamic';

export default async function CodePage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect('/login');

  const [{ data: library }, { data: selected }] = await Promise.all([
    supabase.from('virtues').select('id,name,description').order('default_order'),
    supabase
      .from('user_virtues')
      .select('id,sort_order,is_archived,custom_name,virtue:virtues(id,name,description)')
      .eq('user_id', user.id)
      .order('sort_order'),
  ]);

  return (
    <AppShell title="My Code" subtitle="Select and maintain the virtues you are practicing.">
      <CodeManager library={library ?? []} initial={(selected ?? []) as never[]} />
    </AppShell>
  );
}
