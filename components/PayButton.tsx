'use client';

import React, { useState } from 'react';

export default function PayButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/xendit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        alert(data.error || 'Failed to create payment session');
      }
    } catch (err) {
      console.error(err);
      alert('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full brutalist-btn-emerald py-4 px-4 text-center text-lg tracking-wide shadow-[4px_4px_0px_0px_rgba(65,36,2,1)]"
    >
      {loading ? 'Loading Payment...' : 'Pay Now with Xendit'}
    </button>
  );
}
