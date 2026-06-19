import { describe, it, expect, vi, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/xendit/token/route';
import { saveInvoice, getInvoice, pool } from '../../lib/db';
import { generateShortId } from '../../lib/nanoid';
import { Invoice } from '../../types/invoice';

global.fetch = vi.fn();

describe('Xendit Token API Route', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('generates a payment token url for a pending invoice', async () => {
    const id = generateShortId();
    const mockInvoice: Invoice = {
      id,
      buyerName: 'Customer X',
      buyerPhone: '081234567890',
      items: [{ id: '1', name: 'Product A', quantity: 1, price: 50000 }],
      total: 50000,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await saveInvoice(mockInvoice);

    // Mock fetch for Xendit API
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'xnd_999', invoice_url: 'https://checkout.xendit.co/web/xnd_999' }),
    });

    const req = new NextRequest('http://localhost:3000/api/xendit/token', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.invoice_url).toBe('https://checkout.xendit.co/web/xnd_999');

    // Verify it updated in the DB
    const updated = await getInvoice(id);
    expect(updated?.xenditInvoiceId).toBe('xnd_999');
    expect(updated?.xenditPaymentUrl).toBe('https://checkout.xendit.co/web/xnd_999');
  });
});
