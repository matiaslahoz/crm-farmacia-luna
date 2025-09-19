import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const isAuthPage = url.pathname.startsWith('/login');

  const hasSb = Array.from(req.cookies.getAll()).some(c => c.name.startsWith('sb-'));

  if (hasSb && isAuthPage) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/login'] };
