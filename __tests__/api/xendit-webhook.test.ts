import { describe, it, expect, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/xendit/webhook/route';
import { saveInvoice, getInvoice, pool } from '../../lib/db';
import { generateShortId } from '../../lib/nanoid';
import { Invoice } from '../../types/invoice';

describe('Xendit Webhook route', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('rejects webhooks with incorrect callback token', async () => {
    const req = new NextRequest('http://localhost:3000/api/xendit/webhook', {
      method: 'POST',
      headers: { 'x-callback-token': 'wrong_token' },
      body: JSON.stringify({ external_id: 'nota_123', status: 'PAID' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('processes payment webhooks with correct callback token', async () => {
    const id = generateShortId();
    const mockInvoice: Invoice = {
      id,
      buyerName: 'Customer Y',
      items: [],
      total: 100000,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await saveInvoice(mockInvoice);

    const req = new NextRequest('http://localhost:3000/api/xendit/webhook', {
      method: 'POST',
      headers: { 
        'x-callback-token': 'syumra_callback_secret_token_123' 
      },
      body: JSON.stringify({
        external_id: id,
        status: 'PAID',
        paid_amount: 100000,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify it updated in the DB
    const updated = await getInvoice(id);
    expect(updated?.status).toBe('PAID');
    expect(updated?.paidAt).toBeDefined();
  });
});
