'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const verified = searchParams.get('verified') === 'true';
  const paramError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setResendSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        if (res.status === 403) {
          setShowResend(true);
        }
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendSuccess('');
    setError('');
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to resend verification email.');
      } else {
        setResendSuccess(data.message || 'Verification link resent successfully!');
        setShowResend(false);
      }
    } catch {
      setError('Network error, please try again.');
    } finally {
      setResending(false);
    }
  };

  // Set up feedback message banners based on URL parameters
  let feedbackMessage = '';
  let feedbackType: 'success' | 'error' | null = null;

  if (verified) {
    feedbackMessage = 'Email verified successfully! You can now log in.';
    feedbackType = 'success';
  } else if (paramError) {
    feedbackType = 'error';
    if (paramError === 'missing_token') {
      feedbackMessage = 'Verification token is missing. Please check your verification link.';
    } else if (paramError === 'invalid_token') {
      feedbackMessage = 'Invalid verification token. It may have already been used.';
    } else if (paramError === 'expired_token') {
      feedbackMessage = 'Your verification link has expired. Please register again.';
    } else {
      feedbackMessage = 'Verification failed. Please try again.';
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="brutalist-card p-8 w-full max-w-md text-black">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-1">Login</h1>
        <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-8">
          Sign in to your account
        </p>

        {/* Local Form Error Banner */}
        {error && (
          <div className="bg-red-400 border-3 border-black text-black p-3 font-black text-sm uppercase tracking-wider mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        {/* Resend Action Button (shows after 403 error) */}
        {showResend && (
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full brutalist-btn-cyan py-3 text-sm tracking-wide mb-6"
            type="button"
          >
            {resending ? 'Retrying...' : 'Retry / Resend Verification Link'}
          </button>
        )}

        {/* Resend Success Banner */}
        {resendSuccess && (
          <div className="bg-emerald-400 border-3 border-black text-black p-3 font-black text-sm uppercase tracking-wider mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {resendSuccess}
          </div>
        )}

        {/* Verification Status Feedback Banner */}
        {feedbackMessage && (
          <div className={`${
            feedbackType === 'success' ? 'bg-emerald-400' : 'bg-red-400'
          } border-3 border-black text-black p-3 font-black text-sm uppercase tracking-wider mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
            {feedbackMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full brutalist-input py-3 px-4"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-black uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full brutalist-input py-3 px-4"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full brutalist-btn-black py-4 text-lg tracking-wide"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-bold text-gray-700">
          No account?{' '}
          <Link href="/auth/register" className="underline font-black hover:text-black">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="brutalist-card p-8 w-full max-w-md text-black">
          <p className="text-lg font-black uppercase tracking-wider">Loading...</p>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
