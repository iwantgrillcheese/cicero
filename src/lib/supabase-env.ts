function ensureHttpUrl(raw: string | undefined, label: string) {
  if (!raw) throw new Error(`${label} is missing`);
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`${label} is not a valid URL`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${label} must use http or https`);
  }
  return parsed.toString().replace(/\/$/, '');
}

export function getBrowserSupabaseUrl() {
  return ensureHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
}

export function getServerSupabaseUrl() {
  return ensureHttpUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL'
  );
}

export function getBrowserSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  return key;
}

export function getServerSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY is missing');
  return key;
}

export function getSupabaseHostPreview() {
  try {
    return new URL(getBrowserSupabaseUrl()).host;
  } catch {
    return null;
  }
}
