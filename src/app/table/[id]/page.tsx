'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type TableInfo = {
  id: string;
  table_number: number;
  status: string;
  assigned_waiter_id: string | null;
};

type Waiter = {
  name: string;
  phone: string;
  photo_url: string | null;
};

export default function TableQRPage({ params }: { params: { id: string } }) {
  const [table, setTable] = useState<TableInfo | null>(null);
  const [waiter, setWaiter] = useState<Waiter | null>(null);

  useEffect(() => {
    fetchTable();
  }, []);

  async function fetchTable() {
    const { data: tableData } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('id', params.id)
      .single();

    setTable(tableData);

    if (tableData?.assigned_waiter_id) {
      const { data: waiterData } = await supabase
        .from('staff')
        .select('name, phone, photo_url')
        .eq('id', tableData.assigned_waiter_id)
        .single();
      setWaiter(waiterData);
    }
  }

  if (!table) return <main className="p-10 text-center text-ink/50">Loading table…</main>;

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-wide text-accent mb-1">Table</p>
      <h1 className="text-5xl font-semibold text-ink mb-6">{table.table_number}</h1>

      {waiter ? (
        <div className="bg-white border border-ink/10 rounded-2xl p-6 w-full max-w-sm mb-6">
          <p className="text-sm text-ink/50 mb-1">Your waiter</p>
          <p className="text-xl font-medium text-ink mb-2">{waiter.name}</p>
          <a
            href={`tel:${waiter.phone}`}
            className="inline-block mt-2 px-5 py-2 rounded-full bg-accent text-white text-sm"
          >
            Call {waiter.name.split(' ')[0]}
          </a>
        </div>
      ) : (
        <p className="text-ink/50 mb-6">No waiter assigned yet — a staff member will be with you shortly.</p>
      )}

      <Link
        href="/menu"
        className="px-5 py-2 rounded-full border border-ink/20 text-ink text-sm"
      >
        View Menu &amp; Order
      </Link>
    </main>
  );
}
