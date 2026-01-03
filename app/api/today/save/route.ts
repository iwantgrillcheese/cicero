import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dateISO, note } = await req.json();

  const { error } = await supabase
    .from('daily_entries')
    .update({ note })
    .eq('user_id', userData.user.id)
    .eq('entry_date', dateISO);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
