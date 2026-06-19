import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InvoiceView from '../../components/InvoiceView';
import { Invoice } from '../../types/invoice';
import React from 'react';
import '@testing-library/jest-dom';

const mockInvoice: Invoice = {
  id: 'Xk3mP9qR',
  buyerName: 'Budi Santoso',
  buyerPhone: '081234567890',
  items: [
    { id: '1', name: 'Espresso Maker', quantity: 1, price: 1200000 }
  ],
  total: 1200000,
  status: 'PENDING',
  createdAt: new Date().toISOString(),
};

describe('InvoiceView Component', () => {
  it('renders invoice details correctly', () => {
    render(<InvoiceView invoice={mockInvoice} />);
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getAllByText(/Rp 1.200.000/)[0]).toBeInTheDocument();
  });
});
