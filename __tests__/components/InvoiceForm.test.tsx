import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InvoiceForm from '../../components/InvoiceForm';
import React from 'react';
import '@testing-library/jest-dom';

describe('InvoiceForm Component', () => {
  it('renders input fields and handles adding dynamic rows', () => {
    render(<InvoiceForm />);
    expect(screen.getByLabelText(/Buyer Name/i)).toBeInTheDocument();
    
    const addItemBtn = screen.getByText(/Add Item/i);
    fireEvent.click(addItemBtn);
    
    const nameInputs = screen.getAllByPlaceholderText(/Item Name/i);
    expect(nameInputs.length).toBeGreaterThan(0);
  });
});
