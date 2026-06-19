'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('0');
  const [unit, setUnit] = useState('pcs');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Please enter a valid price (0 or greater)');
      setLoading(false);
      return;
    }

    let stockNum = Number(stockQty);
    if (isUnlimited) {
      stockNum = -1;
    } else if (isNaN(stockNum) || stockNum < 0) {
      setError('Please enter a valid stock quantity (0 or greater) or mark as unlimited');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: priceNum,
          stockQty: stockNum,
          unit: unit || 'pcs',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create product');
      } else {
        router.push('/inventory');
        router.refresh();
      }
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/inventory" className="text-sm font-black uppercase tracking-wider underline text-ink hover:text-dark">
            ← Back to Inventory
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tight text-ink mt-4">Add Product</h1>
          <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mt-1">
            Create a new item in your inventory
          </p>
        </div>

        <div className="brutalist-card p-6 text-ink bg-white">
          {error && (
            <div className="bg-red-400 border-3 border-ink text-ink p-3 font-black text-sm uppercase tracking-wider mb-6 shadow-[2px_2px_0px_0px_rgba(65,36,2,1)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-black uppercase tracking-wider mb-1">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="e.g. Premium Ramen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full brutalist-input py-3 px-4 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-xs font-black uppercase tracking-wider mb-1">
                  Price (Rp)
                </label>
                <input
                  id="price"
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 50000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full brutalist-input py-3 px-4 text-sm"
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-xs font-black uppercase tracking-wider mb-1">
                  Unit
                </label>
                <input
                  id="unit"
                  type="text"
                  required
                  placeholder="e.g. pcs, box, kg"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full brutalist-input py-3 px-4 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Stock Level
              </label>

              <div className="flex items-center space-x-3 mb-3">
                <input
                  id="isUnlimited"
                  type="checkbox"
                  checked={isUnlimited}
                  onChange={(e) => setIsUnlimited(e.target.checked)}
                  className="w-5 h-5 border-3 border-ink rounded-none accent-black cursor-pointer"
                />
                <label htmlFor="isUnlimited" className="text-sm font-black uppercase select-none cursor-pointer">
                  Unlimited Stock
                </label>
              </div>

              {!isUnlimited && (
                <input
                  id="stockQty"
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className="w-full brutalist-input py-3 px-4 text-sm animate-fade-in"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full brutalist-btn-cyan py-4 text-md tracking-wide mt-2"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
