import React from 'react';
import { notFound } from 'next/navigation';
import InvoiceView from '@/components/InvoiceView';
import { getInvoice } from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { status: redirectStatus } = await searchParams;

  // If Xendit redirected with ?status=success, trigger our webhook internally
  // so the DB is updated before we read it (handles localhost where Xendit
  // cannot reach our server from the internet).
  if (redirectStatus === 'success') {
    try {
      const origin = process.env.ROOT_DOMAIN
        ? `http://${process.env.ROOT_DOMAIN}`
        : 'http://localhost:3000';
      await fetch(`${origin}/api/xendit/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-callback-token': process.env.XENDIT_DEV_CALLBACK_TOKEN ?? '',
        },
        body: JSON.stringify({ external_id: id, status: 'PAID', paid_amount: 0 }),
        cache: 'no-store',
      });
    } catch {
      // Non-fatal — webhook may already have been delivered in production
    }
  }

  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  // If Xendit said success but DB is still PENDING (race condition / real webhook
  // delivery is slow), pass a flag so the UI can show a "processing" banner.
  const processingPayment =
    redirectStatus === 'success' && invoice.status === 'PENDING';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <InvoiceView invoice={invoice} processingPayment={processingPayment} />
    </div>
  );
}
