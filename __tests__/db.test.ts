import { describe, it, expect, afterAll } from 'vitest';
import { 
  saveInvoice, 
  getInvoice, 
  updateInvoiceStatus, 
  updateInvoiceXendit, 
  createUser, 
  getUserByEmail, 
  getUserByVerificationToken, 
  verifyUser, 
  pool 
} from '../lib/db';
import { generateShortId } from '../lib/nanoid';
import { Invoice } from '../types/invoice';

describe('Database and Short ID Utilities', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should generate an 8-character alphanumeric short ID', () => {
    const id = generateShortId();
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[0-9A-Za-z]+$/);
  });

  it('should save and retrieve invoices in the Postgres DB', async () => {
    const id = generateShortId();
    const mockInvoice: Invoice = {
      id,
      buyerName: 'Test Buyer',
      buyerPhone: '081234567890',
      items: [
        { id: '1', name: 'Coffee Beans', quantity: 2, price: 50000 }
      ],
      total: 100000,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await saveInvoice(mockInvoice);

    const retrieved = await getInvoice(id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.buyerName).toBe('Test Buyer');
    expect(retrieved?.total).toBe(100000);
    expect(retrieved?.items).toEqual(mockInvoice.items);
  });

  it('should update invoice payment status', async () => {
    const id = generateShortId();
    const mockInvoice: Invoice = {
      id,
      buyerName: 'Test Buyer',
      buyerPhone: '081234567890',
      items: [],
      total: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await saveInvoice(mockInvoice);
    const paidAt = new Date().toISOString();
    await updateInvoiceStatus(id, 'PAID', paidAt);

    const retrieved = await getInvoice(id);
    expect(retrieved?.status).toBe('PAID');
    expect(retrieved?.paidAt).toBeDefined();
  });

  it('should update Xendit credentials', async () => {
    const id = generateShortId();
    const mockInvoice: Invoice = {
      id,
      buyerName: 'Test Buyer',
      buyerPhone: '081234567890',
      items: [],
      total: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await saveInvoice(mockInvoice);
    await updateInvoiceXendit(id, 'xnd_123', 'https://checkout.xendit.co/web/xnd_123');

    const retrieved = await getInvoice(id);
    expect(retrieved?.xenditInvoiceId).toBe('xnd_123');
    expect(retrieved?.xenditPaymentUrl).toBe('https://checkout.xendit.co/web/xnd_123');
  });

  it('should support user creation with verification token and state updates', async () => {
    const email = `test-${Date.now()}@example.com`;
    const token = `token-${Date.now()}`;
    const expires = new Date(Date.now() + 3600000);

    const user = await createUser(email, 'Test Verification User', 'hashed-pwd', token, expires);
    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.isVerified).toBe(false);

    // Get user by email and verify password/verification status
    const fetched = await getUserByEmail(email);
    expect(fetched).not.toBeNull();
    expect(fetched?.isVerified).toBe(false);
    expect(fetched?.passwordHash).toBe('hashed-pwd');

    // Get user by verification token
    const fetchedByToken = await getUserByVerificationToken(token);
    expect(fetchedByToken).not.toBeNull();
    expect(fetchedByToken?.id).toBe(user.id);
    expect(fetchedByToken?.isVerified).toBe(false);

    // Verify user
    await verifyUser(user.id);

    // Verify user status has updated
    const verifiedUser = await getUserByEmail(email);
    expect(verifiedUser?.isVerified).toBe(true);

    // Token should be cleared
    const clearedTokenUser = await getUserByVerificationToken(token);
    expect(clearedTokenUser).toBeNull();
  });
});
