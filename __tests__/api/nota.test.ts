import { describe, it, expect, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../../app/api/nota/route';
import { pool } from '../../lib/db';

describe('Invoice API Route', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should successfully create an invoice, store it, and retrieve it', async () => {
    const payload = {
      buyerName: 'Budi Santoso',
      buyerPhone: '081234567890',
      items: [
        { id: '1', name: 'Premium Coffee Beans', quantity: 2, price: 150000 }
      ]
    };

    // Test POST (Creation)
    const postReq = new NextRequest('http://localhost:3000/api/nota', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const postRes = await POST(postReq);
    const postJson = await postRes.json();

    expect(postRes.status).toBe(200);
    expect(postJson.id).toHaveLength(8);

    const generatedId = postJson.id;

    // Test GET (Retrieval)
    const getReq = new NextRequest(`http://localhost:3000/api/nota?id=${generatedId}`, {
      method: 'GET',
    });

    const getRes = await GET(getReq);
    const getJson = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getJson.buyerName).toBe('Budi Santoso');
    expect(getJson.total).toBe(300000);
    expect(getJson.items).toEqual(payload.items);
  });
});
