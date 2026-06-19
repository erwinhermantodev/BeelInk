import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getProductById } from '@/lib/db';
import EditProductForm from './EditProductForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const product = await getProductById(id, session.id);

  if (!product) {
    redirect('/inventory');
  }

  return <EditProductForm product={product} />;
}
