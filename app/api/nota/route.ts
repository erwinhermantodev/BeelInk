import { NextRequest, NextResponse } from 'next/server';
import { saveInvoice, getInvoice, getProductById } from '@/lib/db';
import { generateShortId } from '@/lib/nanoid';
import { Invoice } from '@/types/invoice';
import { sendWhatsAppInvoice } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const { buyerName, buyerPhone, items, userId } = await req.json();

    if (!buyerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid input payload' }, { status: 400 });
    }

    if (userId) {
      for (const item of items) {
        if (item.productId) {
          const product = await getProductById(item.productId, userId);
          if (!product) {
            return NextResponse.json({ error: `Product "${item.name}" not found in inventory` }, { status: 400 });
          }
          if (product.stockQty !== -1 && product.stockQty < item.quantity) {
            return NextResponse.json(
              { error: `Insufficient stock for "${product.name}". Only ${product.stockQty} left.` },
              { status: 400 }
            );
          }
        }
      }
    }

    const total = items.reduce((sum: number, item: { quantity: number; price: number }) => sum + item.quantity * item.price, 0);
    const id = generateShortId();

    const invoice: Invoice = {
      id,
      buyerName,
      buyerPhone,
      items,
      total,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      userId: userId || undefined,
    };

    await saveInvoice(invoice);

    const origin = req.headers.get('origin') || (process.env.ROOT_DOMAIN ? `http://${process.env.ROOT_DOMAIN}` : 'http://localhost:3000');
    const invoiceLink = `${origin}/nota/${id}`;

    if (buyerPhone) {
      try {
        await sendWhatsAppInvoice(buyerPhone, invoiceLink);
      } catch (err) {
        console.error('Failed to trigger WhatsApp message during creation:', err);
      }
    }

    return NextResponse.json({ id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const invoice = await getInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
