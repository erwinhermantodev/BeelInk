'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-xs font-black uppercase tracking-wider px-4 py-2 border-3 border-black text-black hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-60"
    >
      {loading ? '...' : 'Logout'}
    </button>
  );
}
