import { NextRequest, NextResponse } from 'next/server';
import { getUserByVerificationToken, verifyUser } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_token', req.url));
    }

    const user = await getUserByVerificationToken(token);
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', req.url));
    }

    if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
      return NextResponse.redirect(new URL('/auth/login?error=expired_token', req.url));
    }

    await verifyUser(user.id);

    return NextResponse.redirect(new URL('/auth/login?verified=true', req.url));
  } catch (error) {
    console.error('Error during email verification:', error);
    return NextResponse.redirect(new URL('/auth/login?error=server_error', req.url));
  }
}
