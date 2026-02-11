import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

async function fetchItems(userId: string) {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from('user_virtues')
    .select('id,sort_order,is_archived,custom_name,virtue:virtues(id,name,description)')
    .eq('user_id', userId)
    .order('sort_order');
  return data ?? [];
}

export async function GET() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ items: await fetchItems(data.user.id) });
}

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'add_system') {
    const { data: maxRow } = await supabase.from('user_virtues').select('sort_order').eq('user_id', user.id).order('sort_order', { ascending: false }).limit(1).maybeSingle();
    await supabase.from('user_virtues').upsert({ user_id: user.id, virtue_id: body.virtueId, sort_order: (maxRow?.sort_order ?? -1) + 1 }, { onConflict: 'user_id,virtue_id' });
  }

  if (action === 'add_custom') {
    const { data: maxRow } = await supabase.from('user_virtues').select('sort_order').eq('user_id', user.id).order('sort_order', { ascending: false }).limit(1).maybeSingle();
    await supabase.from('user_virtues').insert({ user_id: user.id, custom_name: body.customName, custom_description: body.customDescription, sort_order: (maxRow?.sort_order ?? -1) + 1 });
  }

  if (action === 'archive') {
    await supabase.from('user_virtues').update({ is_archived: true, archived_at: new Date().toISOString() }).eq('id', body.id).eq('user_id', user.id);
  }

  if (action === 'move') {
    const { data: items } = await supabase.from('user_virtues').select('id,sort_order').eq('user_id', user.id).eq('is_archived', false).order('sort_order');
    const arr = items ?? [];
    const index = arr.findIndex((item) => item.id === body.id);
    const target = index + body.dir;
    if (index >= 0 && target >= 0 && target < arr.length) {
      const a = arr[index];
      const b = arr[target];
      await supabase.from('user_virtues').update({ sort_order: b.sort_order }).eq('id', a.id).eq('user_id', user.id);
      await supabase.from('user_virtues').update({ sort_order: a.sort_order }).eq('id', b.id).eq('user_id', user.id);
    }
  }

  return NextResponse.json({ ok: true });
}
