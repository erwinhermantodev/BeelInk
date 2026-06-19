import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { getInvoicesByUser } from '@/lib/db';
import { Invoice } from '@/types/invoice';

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const colours: Record<Invoice['status'], string> = {
    PAID: 'bg-emerald-400',
    EXPIRED: 'bg-red-400',
    PENDING: 'bg-amber-400',
  };
  return (
    <span className={`${colours[status]} px-2 py-0.5 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}>
      {status}
    </span>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const invoices = await getInvoicesByUser(session.id);

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black uppercase tracking-tight text-black">Dashboard</h1>
          <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mt-1">
            Welcome back, {session.name}
          </p>
        </div>

        {/* Create new invoice CTA */}
        <Link
          href="/"
          className="inline-flex brutalist-btn-cyan px-6 py-3 text-sm mb-8"
        >
          + Create New Invoice
        </Link>

        {/* Invoice history table */}
        {invoices.length === 0 ? (
          <div className="brutalist-card p-12 text-center text-black">
            <p className="text-2xl font-black uppercase mb-2">No invoices yet</p>
            <p className="text-sm font-bold text-gray-600">
              Create your first invoice and it will appear here.
            </p>
          </div>
        ) : (
          <div className="brutalist-card overflow-hidden text-black">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b-4 border-black bg-black text-white text-xs font-black uppercase tracking-wider">
              <div className="col-span-2">ID</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-center">Status</div>
            </div>

            {/* Rows */}
            {invoices.map((inv, i) => (
              <Link
                key={inv.id}
                href={`/nota/${inv.id}`}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b-2 border-black/10 hover:bg-amber-50 transition-colors ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="col-span-2 font-black text-xs font-mono">#{inv.id}</div>
                <div className="col-span-3 font-bold truncate">{inv.buyerName}</div>
                <div className="col-span-3 text-xs font-bold text-gray-600">
                  {new Date(inv.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </div>
                <div className="col-span-2 text-right font-black text-sm">
                  Rp {inv.total.toLocaleString('id-ID')}
                </div>
                <div className="col-span-2 flex justify-center">
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))}

            {/* Footer summary */}
            <div className="px-6 py-4 bg-black text-white flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider">
                Total invoices: {invoices.length}
              </span>
              <span className="text-xs font-black uppercase tracking-wider">
                Paid: {invoices.filter(i => i.status === 'PAID').length} &nbsp;|&nbsp;
                Pending: {invoices.filter(i => i.status === 'PENDING').length}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
