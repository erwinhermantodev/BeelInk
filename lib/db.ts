import { Pool } from 'pg';
import { Invoice } from '../types/invoice';
import { User } from '../types/user';
import { Product } from '../types/product';

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

let initializationPromise: Promise<void> | null = null;

async function ensureTablesExist() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      // Users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Invoices table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS invoices (
          id VARCHAR(8) PRIMARY KEY,
          buyer_name VARCHAR(255) NOT NULL,
          buyer_phone VARCHAR(50),
          items JSONB NOT NULL,
          total INT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          xendit_invoice_id VARCHAR(255),
          xendit_payment_url TEXT,
          paid_at TIMESTAMP WITH TIME ZONE,
          user_id UUID REFERENCES users(id)
        );
      `);

      // Migration: add user_id if missing (idempotent)
      await pool.query(`
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
      `);

      // Products table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name       VARCHAR(255) NOT NULL,
          price      INT NOT NULL,
          stock_qty  INT NOT NULL DEFAULT 0,
          unit       VARCHAR(50) NOT NULL DEFAULT 'pcs',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })();
  }
  return initializationPromise;
}

// ─── Invoice helpers ──────────────────────────────────────────────────────────

function rowToInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    buyerName: row.buyer_name as string,
    buyerPhone: (row.buyer_phone as string) || undefined,
    items: row.items as Invoice['items'],
    total: Number(row.total),
    status: row.status as Invoice['status'],
    createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    xenditInvoiceId: (row.xendit_invoice_id as string) || undefined,
    xenditPaymentUrl: (row.xendit_payment_url as string) || undefined,
    paidAt: row.paid_at ? new Date(row.paid_at as string).toISOString() : undefined,
    userId: (row.user_id as string) || undefined,
  };
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  await ensureTablesExist();
  const res = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
  if (res.rows.length === 0) return null;
  return rowToInvoice(res.rows[0]);
}

export async function saveInvoice(invoice: Invoice): Promise<void> {
  await ensureTablesExist();
  const queryText = `
    INSERT INTO invoices (id, buyer_name, buyer_phone, items, total, status, created_at, xendit_invoice_id, xendit_payment_url, paid_at, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id) DO UPDATE SET
      buyer_name = EXCLUDED.buyer_name,
      buyer_phone = EXCLUDED.buyer_phone,
      items = EXCLUDED.items,
      total = EXCLUDED.total,
      status = EXCLUDED.status,
      xendit_invoice_id = EXCLUDED.xendit_invoice_id,
      xendit_payment_url = EXCLUDED.xendit_payment_url,
      paid_at = EXCLUDED.paid_at;
  `;
  const values = [
    invoice.id,
    invoice.buyerName,
    invoice.buyerPhone || null,
    JSON.stringify(invoice.items),
    invoice.total,
    invoice.status,
    new Date(invoice.createdAt),
    invoice.xenditInvoiceId || null,
    invoice.xenditPaymentUrl || null,
    invoice.paidAt ? new Date(invoice.paidAt) : null,
    invoice.userId || null,
  ];
  await pool.query(queryText, values);
}

export async function updateInvoiceStatus(id: string, status: string, paidAt?: string): Promise<void> {
  await ensureTablesExist();
  await pool.query(
    'UPDATE invoices SET status = $1, paid_at = $2 WHERE id = $3',
    [status, paidAt ? new Date(paidAt) : null, id]
  );
}

export async function updateInvoiceXendit(id: string, xenditInvoiceId: string, xenditPaymentUrl: string): Promise<void> {
  await ensureTablesExist();
  await pool.query(
    'UPDATE invoices SET xendit_invoice_id = $1, xendit_payment_url = $2 WHERE id = $3',
    [xenditInvoiceId, xenditPaymentUrl, id]
  );
}

export async function getInvoicesByUser(userId: string): Promise<Invoice[]> {
  await ensureTablesExist();
  const res = await pool.query(
    'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return res.rows.map(rowToInvoice);
}

// ─── User helpers ─────────────────────────────────────────────────────────────

export async function createUser(email: string, name: string, passwordHash: string): Promise<User> {
  await ensureTablesExist();
  const res = await pool.query(
    'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
    [email, name, passwordHash]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  await ensureTablesExist();
  const res = await pool.query(
    'SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1',
    [email]
  );
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

// ─── Product helpers ──────────────────────────────────────────────────────────

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    price: Number(row.price),
    stockQty: Number(row.stock_qty),
    unit: row.unit as string,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function getProducts(userId: string): Promise<Product[]> {
  await ensureTablesExist();
  const res = await pool.query(
    'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return res.rows.map(rowToProduct);
}

export async function getProductById(id: string, userId: string): Promise<Product | null> {
  await ensureTablesExist();
  const res = await pool.query(
    'SELECT * FROM products WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (res.rows.length === 0) return null;
  return rowToProduct(res.rows[0]);
}

export async function createProduct(
  userId: string,
  name: string,
  price: number,
  stockQty: number,
  unit: string
): Promise<Product> {
  await ensureTablesExist();
  const res = await pool.query(
    'INSERT INTO products (user_id, name, price, stock_qty, unit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, name, price, stockQty, unit]
  );
  return rowToProduct(res.rows[0]);
}

export async function updateProduct(
  id: string,
  userId: string,
  fields: Partial<{ name: string; price: number; stockQty: number; unit: string }>
): Promise<Product | null> {
  await ensureTablesExist();
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (fields.name !== undefined)     { sets.push(`name = $${i++}`);      values.push(fields.name); }
  if (fields.price !== undefined)    { sets.push(`price = $${i++}`);     values.push(fields.price); }
  if (fields.stockQty !== undefined) { sets.push(`stock_qty = $${i++}`); values.push(fields.stockQty); }
  if (fields.unit !== undefined)     { sets.push(`unit = $${i++}`);      values.push(fields.unit); }
  if (sets.length === 0) return getProductById(id, userId);
  values.push(id, userId);
  const res = await pool.query(
    `UPDATE products SET ${sets.join(', ')} WHERE id = $${i++} AND user_id = $${i} RETURNING *`,
    values
  );
  if (res.rows.length === 0) return null;
  return rowToProduct(res.rows[0]);
}

export async function deleteProduct(id: string, userId: string): Promise<boolean> {
  await ensureTablesExist();
  const res = await pool.query(
    'DELETE FROM products WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (res.rowCount ?? 0) > 0;
}

/**
 * Deduct stock for a list of { productId, quantity } pairs.
 * Items with productId = undefined (manual items) are skipped.
 * Items with stockQty = -1 (unlimited) are skipped.
 */
export async function deductStock(
  items: Array<{ productId?: string; quantity: number }>
): Promise<void> {
  await ensureTablesExist();
  for (const item of items) {
    if (!item.productId) continue;
    await pool.query(
      `UPDATE products
       SET stock_qty = GREATEST(stock_qty - $1, 0)
       WHERE id = $2 AND stock_qty != -1`,
      [item.quantity, item.productId]
    );
  }
}
