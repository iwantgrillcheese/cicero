import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dateISO, rows, acted_well, fell_short, rationalized, correction } = await req.json();

  const { data: entry, error: entryError } = await supabase
    .from('daily_entries')
    .upsert({ user_id: user.id, entry_date: dateISO, acted_well, fell_short, rationalized, correction }, { onConflict: 'user_id,entry_date' })
    .select('id')
    .single();

  if (entryError || !entry) return NextResponse.json({ error: entryError?.message ?? 'Could not save entry' }, { status: 400 });

  for (const row of rows as { userVirtueId: string; score: number; note: string }[]) {
    const { error } = await supabase.from('entry_scores').upsert(
      { entry_id: entry.id, user_virtue_id: row.userVirtueId, score: Math.min(5, Math.max(1, row.score)), note: row.note || null },
      { onConflict: 'entry_id,user_virtue_id' }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
