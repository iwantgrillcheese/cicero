'use client';

import { useMemo, useState, useTransition } from 'react';

export default function CompassForm({ initial }: { initial: any | null }) {
  const [fullPotential, setFullPotential] = useState(initial?.full_potential ?? '');
  const [wastedLife, setWastedLife] = useState(initial?.wasted_life ?? '');
  const [commitments, setCommitments] = useState<string[]>(
    (initial?.commitments ?? []) as string[]
  );

  const [newCommitment, setNewCommitment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const ok = useMemo(() => {
    return fullPotential.trim().length >= 40 && wastedLife.trim().length >= 40 && commitments.length >= 1;
  }, [fullPotential, wastedLife, commitments]);

  function addCommitment() {
    const c = newCommitment.trim();
    if (!c) return;
    setCommitments((prev) => Array.from(new Set([...prev, c])));
    setNewCommitment('');
  }

  function removeCommitment(c: string) {
    setCommitments((prev) => prev.filter((x) => x !== c));
  }

  async function save() {
    setSaved(false);
    startTransition(async () => {
      const res = await fetch('/api/compass/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullPotential: fullPotential.trim(),
          wastedLife: wastedLife.trim(),
          commitments,
        }),
      });
      if (res.ok) setSaved(true);
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <Field
        label="What does living up to your potential mean?"
        hint="Write in plain language. Be concrete."
        value={fullPotential}
        onChange={setFullPotential}
        rows={5}
      />

      <div className="my-5 h-px bg-neutral-200" />

      <Field
        label="What would it mean to waste your life?"
        hint="Name the failure mode you fear most."
        value={wastedLife}
        onChange={setWastedLife}
        rows={5}
      />

      <div className="my-5 h-px bg-neutral-200" />

      <div>
        <div className="text-sm font-semibold">Commitments</div>
        <div className="mt-1 text-xs text-neutral-500">
          1–5 things a good life requires of you.
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={newCommitment}
            onChange={(e) => setNewCommitment(e.target.value)}
            placeholder="e.g., Physical excellence"
            className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
          <button
            onClick={addCommitment}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium"
          >
            Add
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {commitments.map((c) => (
            <button
              key={c}
              onClick={() => removeCommitment(c)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700"
              title="Remove"
            >
              {c} <span className="text-neutral-400">×</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          disabled={!ok || isPending}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save Compass'}
        </button>
        {!ok ? (
          <span className="text-xs text-neutral-500">
            Write at least a few sentences for each field and add 1+ commitments.
          </span>
        ) : null}
        {saved ? <span className="text-xs text-neutral-500">Saved.</span> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  rows,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-1 text-xs text-neutral-500">{hint}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
      />
    </div>
  );
}
