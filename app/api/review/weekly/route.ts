import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { weekStart, weeklyReflection, resolution, focusIds } = await req.json();

  const { error } = await supabase.from('weekly_reviews').upsert(
    {
      user_id: user.id,
      week_start: weekStart,
      weekly_reflection: weeklyReflection,
      resolution,
      focus_virtue_ids: focusIds,
    },
    { onConflict: 'user_id,week_start' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
