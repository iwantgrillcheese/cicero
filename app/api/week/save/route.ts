import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { weekStartISO, virtues, q1, q2, q3, q4 } = await req.json();

  // server-side validation (don’t trust client)
  const minWords = 60;
  const wc = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

  if ([q1, q2, q3, q4].some((s) => wc(s) < minWords)) {
    return NextResponse.json({ error: `Each answer must be at least ${minWords} words.` }, { status: 400 });
  }

  const payload = {
    user_id: userData.user.id,
    week_start: weekStartISO,
    virtues,
    q1,
    q2,
    q3,
    q4,
  };

  const { error } = await supabase
    .from('weekly_reflections')
    .upsert(payload, { onConflict: 'user_id,week_start' });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
