export const VIRTUES = [
  'Courage',
  'Temperance',
  'Discipline',
  'Sincerity',
  'Justice',
  'Industry',
  'Humility',
  'Prudence',
] as const;

export type Virtue = (typeof VIRTUES)[number];

function hashStringToInt(input: string) {
  // simple deterministic hash
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function pickDailyVirtue(args: {
  userId: string;
  dateISO: string; // YYYY-MM-DD
  commitments?: string[];
}): Virtue {
  const base = `${args.userId}:${args.dateISO}`;
  const commitments = (args.commitments ?? []).map((s) => s.toLowerCase()).join('|');

  // If commitments mention discipline/effort etc, gently weight
  const weightMap: Record<string, Virtue> = {
    discipline: 'Discipline',
    courage: 'Courage',
    sincerity: 'Sincerity',
    justice: 'Justice',
    temperance: 'Temperance',
    prudence: 'Prudence',
    humility: 'Humility',
    industry: 'Industry',
    effort: 'Industry',
    focus: 'Discipline',
    attention: 'Discipline',
  };

  const hinted = Object.keys(weightMap).find((k) => commitments.includes(k));
  if (hinted) {
    // Every 3rd day, force the hinted virtue; otherwise rotate normally
    const n = hashStringToInt(base);
    if (n % 3 === 0) return weightMap[hinted];
  }

  const idx = hashStringToInt(base + '::virtue') % VIRTUES.length;
  return VIRTUES[idx];
}
