import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';

const PROTECTED_PATHS = ['/dashboard', '/inventory'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('session')?.value;
  const session = token ? await verifyJwt(token) : null;

  if (!session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/inventory', '/inventory/:path*'],
};
