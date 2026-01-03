'use client';

import { useMemo, useState, useTransition } from 'react';

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export default function WeeklyForm({
  weekStartISO,
  virtues,
  initial,
}: {
  weekStartISO: string;
  virtues: string[];
  initial: any | null;
}) {
  const [q1, setQ1] = useState(initial?.q1 ?? '');
  const [q2, setQ2] = useState(initial?.q2 ?? '');
  const [q3, setQ3] = useState(initial?.q3 ?? '');
  const [q4, setQ4] = useState(initial?.q4 ?? '');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const minWords = 60;

  const ok = useMemo(() => {
    return (
      wordCount(q1) >= minWords &&
      wordCount(q2) >= minWords &&
      wordCount(q3) >= minWords &&
      wordCount(q4) >= minWords
    );
  }, [q1, q2, q3, q4]);

  async function submit() {
    setSaved(false);
    startTransition(async () => {
      const res = await fetch('/api/week/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStartISO, virtues, q1, q2, q3, q4 }),
      });
      if (res.ok) setSaved(true);
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <Question
        label="1) How did I actually live this week?"
        hint="Where did your time, energy, and seriousness go?"
        value={q1}
        onChange={setQ1}
        minWords={minWords}
      />
      <div className="my-5 h-px bg-neutral-200" />
      <Question
        label="2) Where did I fall short of who I claim I’m trying to become?"
        hint="No excuses. Just naming."
        value={q2}
        onChange={setQ2}
        minWords={minWords}
      />
      <div className="my-5 h-px bg-neutral-200" />
      <Question
        label="3) What demanded courage, discipline, or honesty — and how did I respond?"
        hint="Not outcomes. Your response."
        value={q3}
        onChange={setQ3}
        minWords={minWords}
      />
      <div className="my-5 h-px bg-neutral-200" />
      <Question
        label="4) What must change next week if I’m serious about my life?"
        hint="Concrete. Costly. Within seven days."
        value={q4}
        onChange={setQ4}
        minWords={minWords}
      />

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={!ok || isPending}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Submit'}
        </button>
        {!ok ? (
          <span className="text-xs text-neutral-500">Write at least {minWords} words per answer.</span>
        ) : null}
        {saved ? <span className="text-xs text-neutral-500">Saved.</span> : null}
      </div>
    </div>
  );
}

function Question({
  label,
  hint,
  value,
  onChange,
  minWords,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  minWords: number;
}) {
  const wc = wordCount(value);
  return (
    <div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-1 text-xs text-neutral-500">{hint}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
      />
      <div className="mt-2 text-xs text-neutral-500">
        {wc} / {minWords} words
      </div>
    </div>
  );
}
