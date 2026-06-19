import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { signJwt, verifyJwt } from '@/lib/auth';
import { SessionPayload } from '@/types/user';

const COOKIE_NAME = 'session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/** Read and verify session from cookie — use in Server Components / Server Actions */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJwt(token);
}

/** Read and verify session from a NextRequest — use in API routes / middleware */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJwt(token);
}

/** Set session cookie on a NextResponse */
export async function setSessionCookie(res: NextResponse, payload: SessionPayload): Promise<void> {
  const token = await signJwt(payload);
  res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

/** Clear session cookie on a NextResponse */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
}
