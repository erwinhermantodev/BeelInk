import { NextRequest, NextResponse } from 'next/server';
import { getInvoice, updateInvoiceStatus, deductStock } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const callbackToken = req.headers.get('x-callback-token');
    const localToken = process.env.XENDIT_DEV_CALLBACK_TOKEN;

    if (!localToken || callbackToken !== localToken) {
      return NextResponse.json({ error: 'Unauthorized callback token' }, { status: 401 });
    }

    const body = await req.json();
    const { external_id, status } = body;

    if (!external_id) {
      return NextResponse.json({ error: 'Missing external_id' }, { status: 400 });
    }

    const invoice = await getInvoice(external_id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (status === 'PAID' || status === 'SETTLED') {
      await updateInvoiceStatus(external_id, 'PAID', new Date().toISOString());
      // Deduct stock for any invoice items linked to a product
      await deductStock(invoice.items);
    } else if (status === 'EXPIRED') {
      await updateInvoiceStatus(external_id, 'EXPIRED');
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
