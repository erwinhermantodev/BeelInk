export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  productId?: string; // links to a products row for stock deduction
}

export interface Invoice {
  id: string;
  buyerName: string;
  buyerPhone?: string;
  items: InvoiceItem[];
  total: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  createdAt: string;
  xenditInvoiceId?: string;
  xenditPaymentUrl?: string;
  paidAt?: string;
  userId?: string;
}
