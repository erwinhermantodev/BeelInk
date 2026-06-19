export interface Product {
  id: string;
  userId: string;
  name: string;
  price: number;       // in rupiah
  stockQty: number;    // -1 = unlimited
  unit: string;        // e.g. 'pcs', 'kg', 'box'
  createdAt: string;
}
