'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
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

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="brutalist-card p-8 w-full max-w-md text-black">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-1">Register</h1>
        <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-8">
          Create your free account
        </p>

        {error && (
          <div className="bg-red-400 border-3 border-black text-black p-3 font-black text-sm uppercase tracking-wider mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-black uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full brutalist-input py-3 px-4"
            />
          </div>
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
              Password <span className="normal-case font-bold text-gray-500">(min. 8 chars)</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full brutalist-input py-3 px-4"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-xs font-black uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full brutalist-input py-3 px-4"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full brutalist-btn-cyan py-4 text-lg tracking-wide"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-bold text-gray-700">
          Already have an account?{' '}
          <Link href="/auth/login" className="underline font-black hover:text-black">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
