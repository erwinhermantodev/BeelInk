import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, updateUserVerificationToken } from '@/lib/db';
import { sendValidationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    // Silent success for security (prevent user enumeration)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a verification link has been resent.'
      });
    }

    if (user.isVerified) {
      return NextResponse.json({
        success: true,
        message: 'This email is already verified. You can log in directly.'
      });
    }

    const verificationToken = crypto.randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await updateUserVerificationToken(user.id, verificationToken, verificationExpires);

    // Dispatch validation email asynchronously
    sendValidationEmail(email, user.name, verificationToken).catch(err => {
      console.error('Failed to dispatch verification email:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Verification link resent successfully. Please check your inbox.'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
