'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Check, Copy } from 'lucide-react';
import { InvoiceItem } from '@/types/invoice';
import { Product } from '@/types/product';

export default function InvoiceForm({ userId }: { userId?: string }) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', name: '', quantity: 1, price: 0 }
  ]);
  const [products, setProducts] = useState<Product[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error('Failed to load products', err));
  }, [userId]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = <K extends keyof InvoiceItem>(id: string, field: K, value: InvoiceItem[K]) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const selectProductForItem = (itemId: string, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setItems(items.map(item => item.id === itemId ? {
        ...item,
        productId: prod.id,
        name: prod.name,
        price: prod.price
      } : item));
    } else {
      setItems(items.map(item => item.id === itemId ? {
        ...item,
        productId: '', // Keep empty string to show it's in inventory mode but unselected
        name: '',
        price: 0
      } : item));
    }
  };

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!buyerName) {
      alert('Buyer Name is required');
      return;
    }
    
    for (const item of items) {
      if (item.productId !== undefined && !item.productId) {
        alert('Please select a product from inventory or switch to manual input');
        return;
      }
      if (!item.name) {
        alert('Item Name is required');
        return;
      }
      if (item.price <= 0) {
        alert('Item Price must be greater than 0');
        return;
      }
      if (item.quantity <= 0) {
        alert('Item Quantity must be greater than 0');
        return;
      }

      // Check stock limits client-side
      if (item.productId) {
        const prod = products.find(p => p.id === item.productId);
        if (prod && prod.stockQty !== -1 && item.quantity > prod.stockQty) {
          alert(`Insufficient stock for "${prod.name}". Only ${prod.stockQty} left, but you requested ${item.quantity}.`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/nota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerName, buyerPhone, items, userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create invoice');
      } else if (data.id) {
        const link = `${window.location.origin}/nota/${data.id}`;
        setGeneratedLink(link);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate invoice link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (generatedLink) {
    const waText = encodeURIComponent(`Halo ${buyerName}, berikut link digital invoice untuk pembayaran tagihan Anda: ${generatedLink}`);
    const waLink = `https://api.whatsapp.com/send?phone=${buyerPhone.replace(/[^0-9]/g, '')}&text=${waText}`;

    return (
      <div className="brutalist-card p-8 max-w-lg mx-auto text-black bg-white">
        <h2 className="text-3xl font-black mb-2 text-center uppercase tracking-tight">
          Invoice Created!
        </h2>
        <p className="text-gray-700 text-center font-bold mb-6">Share the link with your customer via WhatsApp.</p>
        
        <div className="bg-white border-3 border-ink p-4 flex items-center justify-between mb-6 shadow-[2px_2px_0px_0px_rgba(65,36,2,1)]">
          <span className="truncate text-sm font-bold text-black mr-2">{generatedLink}</span>
          <button 
            onClick={handleCopy} 
            className="p-2 border-3 border-ink hover:bg-zinc-100 transition active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(65,36,2,1)] bg-white cursor-pointer"
            title="Copy Link"
          >
            {copied ? <Check className="text-emerald-600 w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full brutalist-btn-emerald py-4 px-4 text-center text-lg tracking-wide shadow-[4px_4px_0px_0px_rgba(65,36,2,1)]"
          >
            Share to WhatsApp
          </a>
          <button 
            onClick={() => { setGeneratedLink(''); setBuyerName(''); setBuyerPhone(''); setItems([{ id: '1', name: '', quantity: 1, price: 0 }]); }}
            className="w-full brutalist-btn-black py-4 px-4 text-center text-lg tracking-wide shadow-[4px_4px_0px_0px_rgba(65,36,2,1)] cursor-pointer"
          >
            Create New Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="brutalist-card p-8 max-w-2xl mx-auto text-black bg-white">
      <h2 className="text-3xl font-black mb-6 text-center uppercase tracking-tight">
        Create Instant Invoice
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="buyerName" className="block text-sm font-black uppercase text-black mb-2">Buyer Name</label>
          <input
            id="buyerName"
            type="text"
            required
            placeholder="e.g. Budi Santoso"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="w-full brutalist-input py-2 px-3 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="buyerPhone" className="block text-sm font-black uppercase text-black mb-2">WhatsApp Number (Optional)</label>
          <input
            id="buyerPhone"
            type="text"
            placeholder="e.g. 081234567890"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            className="w-full brutalist-input py-2 px-3 focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-black uppercase text-black">Items</label>
          {products.length === 0 && userId && (
            <Link href="/inventory/new" className="text-xs font-black uppercase underline text-gray-600 hover:text-black">
              + Setup Products first
            </Link>
          )}
        </div>
        
        {items.map((item) => {
          const isFromInventory = item.productId !== undefined;
          return (
            <div key={item.id} className="border-3 border-ink p-4 mb-4 bg-zinc-50 shadow-[2px_2px_0px_0px_rgba(65,36,2,1)]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase bg-ink text-white px-2 py-0.5">
                  Item Row
                </span>
                
                {products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isFromInventory) {
                        // Switch to manual input
                        setItems(items.map(i => i.id === item.id ? { id: i.id, name: '', quantity: 1, price: 0 } : i));
                      } else {
                        // Switch to inventory selection
                        setItems(items.map(i => i.id === item.id ? { id: i.id, name: '', quantity: 1, price: 0, productId: '' } : i));
                      }
                    }}
                    className="text-[10px] font-black uppercase px-2 py-1 border-2 border-ink bg-white hover:bg-ink hover:text-light transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(65,36,2,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  >
                    {isFromInventory ? '✍️ Custom Item' : '📦 Pick From Inventory'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Name</label>
                  {isFromInventory ? (
                    <select
                      value={item.productId || ''}
                      onChange={(e) => selectProductForItem(item.id, e.target.value)}
                      className="w-full brutalist-input py-2 px-3 text-sm bg-white"
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stockQty === 0}>
                          {p.name} (Rp {p.price.toLocaleString('id-ID')}) {p.stockQty === -1 ? '(∞)' : p.stockQty === 0 ? '(OUT OF STOCK)' : `(${p.stockQty} left)`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Item Name"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full brutalist-input py-2 px-3 focus:outline-none"
                    />
                  )}
                </div>

                <div className="col-span-4 md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full brutalist-input py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="col-span-6 md:col-span-3">
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Price</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Price"
                    value={item.price || ''}
                    onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                    className="w-full brutalist-input py-2 px-3 focus:outline-none"
                    disabled={isFromInventory} // Price is locked if it's from inventory
                  />
                </div>

                <div className="col-span-2 md:col-span-1 flex justify-center pt-4 md:pt-0">
                  <button
                    type="button"
                    disabled={items.length === 1}
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 transition p-1 cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        <button
          type="button"
          onClick={addItem}
          className="text-sm text-black font-black uppercase flex items-center gap-1 mt-3 transition hover:underline cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[3px]" /> Add Item
        </button>
      </div>

      <div className="border-t-4 border-ink pt-4 flex justify-between items-center mb-6">
        <span className="font-black text-lg uppercase text-black">Total Amount:</span>
        <span className="text-3xl font-black text-black">
          Rp {total.toLocaleString('id-ID')}
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full brutalist-btn-cyan py-4 px-4 text-center text-lg tracking-wide shadow-[4px_4px_0px_0px_rgba(65,36,2,1)]"
      >
        {loading ? 'Generating...' : 'Create Invoice Link'}
      </button>
    </form>
  );
}
