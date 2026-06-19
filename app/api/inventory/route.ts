import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const products = await getProducts(session.id);
    return NextResponse.json(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, price, stockQty, unit } = await req.json();
    if (!name || price === undefined || price < 0) {
      return NextResponse.json({ error: 'Name and a valid price are required' }, { status: 400 });
    }

    const product = await createProduct(
      session.id,
      name,
      Number(price),
      stockQty !== undefined ? Number(stockQty) : 0,
      unit || 'pcs'
    );
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
