import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = await supabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fullPotential, wastedLife, commitments } = await req.json();

  if (!fullPotential || fullPotential.length < 40) {
    return NextResponse.json({ error: 'fullPotential too short' }, { status: 400 });
  }
  if (!wastedLife || wastedLife.length < 40) {
    return NextResponse.json({ error: 'wastedLife too short' }, { status: 400 });
  }

  const payload = {
    user_id: userData.user.id,
    full_potential: fullPotential,
    wasted_life: wastedLife,
    commitments: Array.isArray(commitments) ? commitments : [],
  };

  const { error } = await supabase.from('compass').upsert(payload, {
    onConflict: 'user_id',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
