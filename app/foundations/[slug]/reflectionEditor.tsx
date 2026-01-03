'use client';

import { useState } from 'react';

export default function ReflectionEditor({
  entryId,
  initialBody,
}: {
  entryId: string;
  initialBody: string;
}) {
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const res = await fetch('/api/foundations/reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, body }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json?.error ?? 'Failed to save');
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="mt-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={8}
        className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-6 outline-none focus:border-neutral-400"
        placeholder="Write here..."
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        {saved ? <div className="text-sm text-neutral-600">Saved</div> : null}
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
      </div>
    </div>
  );
}
