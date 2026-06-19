import { NextRequest, NextResponse } from 'next/server';
import { getInvoice, updateInvoiceXendit } from '@/lib/db';
import { createXenditInvoice } from '@/lib/xendit';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 });
    }

    const invoice = await getInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    // Reuse Xendit URL if already generated
    if (invoice.xenditPaymentUrl) {
      return NextResponse.json({ invoice_url: invoice.xenditPaymentUrl });
    }

    const xenditResponse = await createXenditInvoice({
      id: invoice.id,
      amount: invoice.total,
      description: `Payment for Invoice #${invoice.id} - ${invoice.buyerName}`,
      buyerName: invoice.buyerName,
      buyerPhone: invoice.buyerPhone,
    });

    await updateInvoiceXendit(invoice.id, xenditResponse.id, xenditResponse.invoice_url);

    return NextResponse.json({ invoice_url: xenditResponse.invoice_url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
