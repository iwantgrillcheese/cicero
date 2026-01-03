'use client';

import { useState, useTransition } from 'react';

export default function TodayForm({
  dateISO,
  initialNote,
}: {
  dateISO: string;
  initialNote: string;
}) {
  const [note, setNote] = useState(initialNote);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaved(false);

    const body = { dateISO, note: note.trim() === '' ? null : note.trim() };
    startTransition(async () => {
      const res = await fetch('/api/today/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) setSaved(true);
    });
  }

  return (
    <div className="mt-4">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Where was it tested? Where did you resist it?"
        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          disabled={isPending}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        {saved ? <span className="text-xs text-neutral-500">Saved.</span> : null}
      </div>
    </div>
  );
}
