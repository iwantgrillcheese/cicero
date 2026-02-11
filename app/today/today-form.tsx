'use client';

import { useState, useTransition } from 'react';

type Item = { userVirtueId: string; name: string; initialScore: number | null; initialNote: string | null };

export default function TodayForm({ dateISO, virtues, initial }: { dateISO: string; virtues: Item[]; initial: Record<string, { score: number | null; note: string | null }> }) {
  const [rows, setRows] = useState(
    virtues.map((item) => ({
      ...item,
      score: initial[item.userVirtueId]?.score ?? item.initialScore ?? 3,
      note: initial[item.userVirtueId]?.note ?? item.initialNote ?? '',
    }))
  );
  const [reflection, setReflection] = useState({ acted_well: '', fell_short: '', rationalized: '', correction: '' });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function updateRow(index: number, key: 'score' | 'note', value: string | number) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      const res = await fetch('/api/today/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateISO, rows, ...reflection }),
      });
      if (res.ok) setSaved(true);
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div key={item.userVirtueId} className="rounded-md border border-neutral-200 p-3">
            <div className="font-medium">{item.name}</div>
            <div className="mt-2 flex items-center gap-3">
              <label className="text-xs text-neutral-500">Alignment (1-5)</label>
              <input type="number" min={1} max={5} value={item.score} onChange={(e) => updateRow(index, 'score', Number(e.target.value))} className="w-16 rounded border border-neutral-300 px-2 py-1 text-sm" />
            </div>
            <textarea value={item.note ?? ''} onChange={(e) => updateRow(index, 'note', e.target.value)} rows={2} placeholder="Optional note" className="mt-2 w-full rounded border border-neutral-300 px-2 py-1 text-sm" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {(['acted_well', 'fell_short', 'rationalized', 'correction'] as const).map((key) => (
          <textarea
            key={key}
            value={reflection[key]}
            onChange={(e) => setReflection((prev) => ({ ...prev, [key]: e.target.value }))}
            rows={3}
            placeholder={key.replace('_', ' ')}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
          />
        ))}
      </div>
      <button onClick={save} disabled={pending} className="rounded bg-black px-4 py-2 text-sm text-white">
        {pending ? 'Saving...' : 'Save Entry'}
      </button>
      {saved ? <p className="text-xs text-neutral-500">Saved.</p> : null}
    </div>
  );
}
