'use client';

import { useState, useTransition } from 'react';

export default function LessonProgressButton({ lessonId, initiallyCompleted }: { lessonId: string; initiallyCompleted: boolean }) {
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await fetch('/api/academy/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: !completed }),
      });
      if (res.ok) setCompleted((v) => !v);
    });
  }

  return (
    <button onClick={toggle} disabled={pending} className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-60">
      {pending ? 'Saving...' : completed ? 'Mark incomplete' : 'Mark complete'}
    </button>
  );
}
