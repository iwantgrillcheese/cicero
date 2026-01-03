import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Cicero
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        OAuth is wired. Next: build the daily practice.
      </p>

      <Link
        href="/login"
        className="mt-6 inline-flex rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Sign in
      </Link>
    </main>
  );
}
