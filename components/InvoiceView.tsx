import React from 'react';
import Image from 'next/image';
import { Invoice } from '@/types/invoice';
import PayButton from './PayButton';

export default function InvoiceView({
  invoice,
  processingPayment = false,
}: {
  invoice: Invoice;
  processingPayment?: boolean;
}) {
  const { id, buyerName, buyerPhone, items, total, status, createdAt } = invoice;

  return (
    <div className="brutalist-card p-8 max-w-xl mx-auto text-black w-full bg-white">
      <div className="flex justify-between items-start border-b-4 border-ink pb-6 mb-6">
        <div className="flex items-center gap-3">
          <Image 
            src="https://res.cloudinary.com/karyalaza-indonesia/image/upload/v1781861281/image_Pippit_202606191627_vjbutq.png" 
            alt="BeelInk Logo" 
            width={40}
            height={40}
            className="h-10 w-auto object-contain"
          />
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase text-ink">BeelInk</h2>
            <p className="text-sm font-bold text-gray-600 mt-1">Invoice ID: #{id}</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 border-3 border-ink text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(65,36,2,1)] ${
          status === 'PAID' ? 'bg-primary text-light' :
          status === 'EXPIRED' ? 'bg-red-400 text-ink' :
          processingPayment ? 'bg-honey/75 text-ink' :
          'bg-honey text-ink'
        }`}>
          {processingPayment ? 'PROCESSING' : status}
        </span>
      </div>

      <div className="mb-6 text-sm text-black">
        <h3 className="font-black uppercase text-gray-700 mb-2">Customer Details:</h3>
        <p className="font-black text-base">{buyerName}</p>
        {buyerPhone && <p className="text-xs font-bold text-gray-600">{buyerPhone}</p>}
        <p className="text-xs font-bold text-gray-500 mt-1">
          Date: {new Date(createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-black uppercase text-gray-700 mb-2">Purchased Items:</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm border-b-2 border-black/10 pb-2 text-black">
              <div>
                <p className="font-black">{item.name}</p>
                <p className="text-xs font-bold text-gray-600">
                  {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                </p>
              </div>
              <span className="font-black">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center border-t-4 border-ink pt-4 mb-6 text-black">
        <span className="font-black text-lg uppercase">Grand Total:</span>
        <span className="text-3xl font-black">
          Rp {total.toLocaleString('id-ID')}
        </span>
      </div>

      {processingPayment ? (
        <div className="bg-honey border-3 border-ink text-ink p-4 text-center font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(65,36,2,1)]">
          ⏳ Payment received — verifying with Xendit...
        </div>
      ) : status === 'PENDING' ? (
        <PayButton id={id} />
      ) : status === 'PAID' ? (
        <div className="bg-primary border-3 border-ink text-light p-4 text-center font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(65,36,2,1)]">
          ✅ Payment Successful. Thank you!
        </div>
      ) : (
        <div className="bg-red-400 border-3 border-ink text-ink p-4 text-center font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(65,36,2,1)]">
          Invoice Expired
        </div>
      )}
    </div>
  );
}
