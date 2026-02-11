import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATH_PREFIXES = ['/login', '/auth/callback'];
const PUBLIC_EXACT_PATHS = ['/', '/favicon.ico'];

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function hasSupabaseAuthCookie(req: NextRequest) {
  return req.cookies.getAll().some((cookie) => cookie.name.includes('-auth-token'));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Fast path for pages that do not require auth/session refresh.
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Avoid middleware failure loops when env vars are unavailable.
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // If no auth cookie is present, avoid network calls and redirect early.
  if (!hasSupabaseAuthCookie(req)) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    // Refresh cookies for authenticated routes.
    await supabase.auth.getUser();
  } catch {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/academy/:path*',
    '/today/:path*',
    '/code/:path*',
    '/history/:path*',
    '/review/:path*',
    '/insights/:path*',
    '/settings/:path*',
    '/week/:path*',
    '/compass/:path*',
    '/foundations/:path*',
    '/logout',
  ],
};
