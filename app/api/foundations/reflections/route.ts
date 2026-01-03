import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { entryId, body } = await req.json();

  if (!entryId || typeof entryId !== 'string') {
    return NextResponse.json({ error: 'Missing entryId' }, { status: 400 });
  }
  if (typeof body !== 'string') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { error } = await supabase.from('philosophy_reflections').upsert(
    {
      user_id: userData.user.id,
      entry_id: entryId,
      body,
    },
    { onConflict: 'user_id,entry_id' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
