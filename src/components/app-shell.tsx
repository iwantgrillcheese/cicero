'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/academy', label: 'Academy' },
  { href: '/today', label: 'Today' },
  { href: '/code', label: 'My Code' },
  { href: '/history', label: 'History' },
  { href: '/review/weekly', label: 'Weekly Review' },
  { href: '/insights', label: 'Insights' },
  { href: '/settings', label: 'Settings' },
];

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="w-56 shrink-0">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Cicero
          </Link>
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm ${
                    active ? 'bg-white font-medium text-neutral-900 shadow-sm' : 'text-neutral-600 hover:bg-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/logout" className="mt-8 block text-sm text-neutral-500 underline">
            Log out
          </Link>
        </aside>
        <main className="flex-1 rounded-xl border border-neutral-200 bg-white p-8">
          <header className="mb-8 border-b border-neutral-200 pb-5">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-neutral-600">{subtitle}</p> : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
