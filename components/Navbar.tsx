import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/session';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className="border-b-4 border-ink bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 text-xl font-black uppercase tracking-tight hover:opacity-70 transition-opacity text-ink">
          <Image 
            src="https://res.cloudinary.com/karyalaza-indonesia/image/upload/v1781861281/image_Pippit_202606191627_vjbutq.png" 
            alt="BeelInk Logo" 
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <span>BeelInk</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="text-xs font-black uppercase tracking-wider text-gray-600 hidden sm:block">
                {session.name}
              </span>
              <Link
                href="/dashboard"
                className="brutalist-btn-black px-4 py-2 text-xs"
              >
                Dashboard
              </Link>
              <Link
                href="/inventory"
                className="brutalist-btn-cyan px-4 py-2 text-xs"
              >
                Inventory
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-xs font-black uppercase tracking-wider px-4 py-2 border-3 border-ink hover:bg-ink hover:text-light transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="brutalist-btn-cyan px-4 py-2 text-xs"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
