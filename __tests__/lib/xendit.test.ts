import { describe, it, expect, vi } from 'vitest';
import { createXenditInvoice } from '../../lib/xendit';

global.fetch = vi.fn();

describe('Xendit Library integration', () => {
  it('correctly posts invoice data to Xendit', async () => {
    const mockResponse = { id: 'xnd_123', invoice_url: 'https://checkout.xendit.co/web/xnd_123' };
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await createXenditInvoice({
      id: 'nota_123',
      amount: 150000,
      description: 'Billing for Budi Santoso',
      buyerName: 'Budi Santoso',
    });

    expect(result.invoice_url).toBe('https://checkout.xendit.co/web/xnd_123');
    expect(fetch).toHaveBeenCalledWith('https://api.xendit.co/v2/invoices', expect.any(Object));
  });
});
