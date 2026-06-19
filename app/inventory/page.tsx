import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { getProducts } from '@/lib/db';
import { Product } from '@/types/product';

function StockBadge({ qty }: { qty: number }) {
  if (qty === -1) return <span className="px-2 py-0.5 border-2 border-ink text-xs font-black bg-sky-300 text-black shadow-[1px_1px_0px_0px_rgba(65,36,2,1)]">∞ UNLIMITED</span>;
  if (qty === 0)  return <span className="px-2 py-0.5 border-2 border-ink text-xs font-black bg-red-400 text-black shadow-[1px_1px_0px_0px_rgba(65,36,2,1)]">OUT OF STOCK</span>;
  if (qty <= 5)   return <span className="px-2 py-0.5 border-2 border-ink text-xs font-black bg-honey text-ink shadow-[1px_1px_0px_0px_rgba(65,36,2,1)]">{qty} LOW</span>;
  return <span className="px-2 py-0.5 border-2 border-ink text-xs font-black bg-primary text-light shadow-[1px_1px_0px_0px_rgba(65,36,2,1)]">{qty}</span>;
}

export default async function InventoryPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const products: Product[] = await getProducts(session.id);

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tight text-ink">Inventory</h1>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mt-1">
              Manage your products &amp; stock
            </p>
          </div>
          <Link href="/inventory/new" className="brutalist-btn-cyan px-6 py-3 text-sm">
            + Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="brutalist-card p-12 text-center text-ink bg-white">
            <p className="text-2xl font-black uppercase mb-2">No products yet</p>
            <p className="text-sm font-bold text-gray-600 mb-6">
              Add your first product and it will appear when creating invoices.
            </p>
            <Link href="/inventory/new" className="brutalist-btn-cyan px-6 py-3 text-sm">
              + Add First Product
            </Link>
          </div>
        ) : (
          <div className="brutalist-card overflow-hidden text-ink bg-white">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b-4 border-ink bg-ink text-light text-xs font-black uppercase tracking-wider">
              <div className="col-span-4">Product</div>
              <div className="col-span-2">Unit</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-center">Stock</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {products.map((p, i) => (
              <div
                key={p.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b-2 border-ink/10 ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="col-span-4 font-black">{p.name}</div>
                <div className="col-span-2 text-sm font-bold text-gray-600 uppercase">{p.unit}</div>
                <div className="col-span-2 text-right font-black text-sm">
                  Rp {p.price.toLocaleString('id-ID')}
                </div>
                <div className="col-span-2 flex justify-center">
                  <StockBadge qty={p.stockQty} />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Link
                    href={`/inventory/${p.id}/edit`}
                    className="text-xs font-black uppercase border-2 border-ink px-3 py-1 hover:bg-ink hover:text-light transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}

            <div className="px-6 py-4 bg-ink text-light flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider">
                Total products: {products.length}
              </span>
              <span className="text-xs font-black uppercase tracking-wider">
                Out of stock: {products.filter(p => p.stockQty === 0).length}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
