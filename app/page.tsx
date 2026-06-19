import Link from 'next/link';
import { redirect } from 'next/navigation';
import InvoiceForm from '@/components/InvoiceForm';
import { getSession } from '@/lib/session';

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <main className="min-h-screen flex flex-col justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-2 flex flex-col items-center">
        <Link
          href="/dashboard"
          className="inline-block mt-4 text-xs font-black uppercase tracking-wider underline text-gray-700 hover:text-ink"
        >
          View your invoice history →
        </Link>
      </div>
      <InvoiceForm userId={session.id} />
    </main>
  );
}
