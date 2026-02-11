'use client';

import { useState, useTransition } from 'react';

type Virtue = { id: string; label: string };

export default function WeeklyReviewForm({ weekStart, virtues, initial }: { weekStart: string; virtues: Virtue[]; initial?: { weekly_reflection?: string | null; resolution?: string | null; focus_virtue_ids?: string[] } | null }) {
  const [weeklyReflection, setWeeklyReflection] = useState(initial?.weekly_reflection ?? '');
  const [resolution, setResolution] = useState(initial?.resolution ?? '');
  const [focusIds, setFocusIds] = useState<string[]>(initial?.focus_virtue_ids ?? []);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggleFocus(id: string) {
    setFocusIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : prev.length >= 2 ? [...prev.slice(1), id] : [...prev, id]));
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      const res = await fetch('/api/review/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart, weeklyReflection, resolution, focusIds }),
      });
      if (res.ok) setSaved(true);
    });
  }

  return (
    <div className="space-y-4">
      <textarea value={weeklyReflection} onChange={(e) => setWeeklyReflection(e.target.value)} rows={4} placeholder="Weekly reflection" className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" />
      <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3} placeholder="Resolution for next week" className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" />
      <div>
        <div className="mb-2 text-sm font-medium">Focus virtues (1–2)</div>
        <div className="flex flex-wrap gap-2">
          {virtues.map((virtue) => (
            <button key={virtue.id} onClick={() => toggleFocus(virtue.id)} className={`rounded border px-2 py-1 text-xs ${focusIds.includes(virtue.id) ? 'bg-black text-white' : ''}`}>
              {virtue.label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={save} disabled={pending} className="rounded bg-black px-4 py-2 text-sm text-white">{pending ? 'Saving...' : 'Save Weekly Review'}</button>
      {saved ? <div className="text-xs text-neutral-500">Saved.</div> : null}
    </div>
  );
}
