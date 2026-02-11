'use client';

import { useState, useTransition } from 'react';

type Virtue = { id: string; name: string; description: string };
type UserVirtue = { id: string; sort_order: number; is_archived: boolean; custom_name: string | null; virtue: Virtue | null };

export default function CodeManager({ library, initial }: { library: Virtue[]; initial: UserVirtue[] }) {
  const [userVirtues, setUserVirtues] = useState(initial);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [pending, startTransition] = useTransition();

  async function refresh() {
    const res = await fetch('/api/code/user-virtues');
    if (res.ok) {
      const payload = await res.json();
      setUserVirtues(payload.items);
    }
  }

  function addSystem(virtueId: string) {
    startTransition(async () => {
      await fetch('/api/code/user-virtues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add_system', virtueId }) });
      await refresh();
    });
  }

  function addCustom() {
    if (!customName.trim()) return;
    startTransition(async () => {
      await fetch('/api/code/user-virtues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add_custom', customName: customName.trim(), customDescription: customDescription.trim() || null }) });
      setCustomName('');
      setCustomDescription('');
      await refresh();
    });
  }

  function move(id: string, dir: -1 | 1) {
    startTransition(async () => {
      await fetch('/api/code/user-virtues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'move', id, dir }) });
      await refresh();
    });
  }

  function archive(id: string) {
    startTransition(async () => {
      await fetch('/api/code/user-virtues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'archive', id }) });
      await refresh();
    });
  }

  const selectedVirtueIds = new Set(userVirtues.filter((item) => !item.is_archived && item.virtue).map((item) => item.virtue!.id));

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Your Active Virtues</h2>
        <ul className="mt-3 space-y-2">
          {userVirtues.filter((item) => !item.is_archived).map((item, index) => (
            <li key={item.id} className="rounded-md border border-neutral-200 p-3">
              <div className="font-medium">{item.custom_name ?? item.virtue?.name}</div>
              <div className="mt-2 flex gap-2 text-xs">
                <button onClick={() => move(item.id, -1)} disabled={pending || index === 0} className="rounded border px-2 py-1">Up</button>
                <button onClick={() => move(item.id, 1)} disabled={pending || index === userVirtues.length - 1} className="rounded border px-2 py-1">Down</button>
                <button onClick={() => archive(item.id)} disabled={pending} className="rounded border px-2 py-1">Archive</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Virtue Library</h2>
        <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
          {library.map((virtue) => (
            <li key={virtue.id} className="rounded-md border border-neutral-200 p-3">
              <div className="font-medium">{virtue.name}</div>
              <p className="mt-1 text-xs text-neutral-600">{virtue.description}</p>
              <button onClick={() => addSystem(virtue.id)} disabled={pending || selectedVirtueIds.has(virtue.id)} className="mt-2 rounded border px-2 py-1 text-xs disabled:opacity-50">
                {selectedVirtueIds.has(virtue.id) ? 'Added' : 'Add'}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-md border border-neutral-200 p-3">
          <h3 className="text-sm font-medium">Custom Virtue</h3>
          <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Name" className="mt-2 w-full rounded border border-neutral-300 px-2 py-1 text-sm" />
          <textarea value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} placeholder="Description (optional)" className="mt-2 w-full rounded border border-neutral-300 px-2 py-1 text-sm" rows={3} />
          <button onClick={addCustom} disabled={pending} className="mt-2 rounded bg-black px-3 py-2 text-xs text-white">Add Custom Virtue</button>
        </div>
      </section>
    </div>
  );
}
