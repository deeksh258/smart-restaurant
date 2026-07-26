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

  if (!table) return <main className="min-h-screen bg-paper p-10 text-center text-ink/50">Loading table…</main>;

  return (
    <main className="min-h-screen bg-coal text-paper flex flex-col items-center justify-center px-6 text-center">
      <p className="ticket-number mb-1">TABLE</p>
      <h1 className="font-display text-7xl mb-8">{table.table_number}</h1>

      {waiter ? (
        <div className="bg-paper text-ink rounded-2xl p-6 w-full max-w-sm mb-6 ticket-card">
          <p className="ticket-number mb-1">YOUR WAITER</p>
          <p className="font-display text-2xl mb-3">{waiter.name}</p>
          
            href={`tel:${waiter.phone}`}
            className="inline-block px-5 py-2.5 rounded-full bg-brass text-coal text-sm font-semibold"
          >
            Call {waiter.name.split(' ')[0]}
          </a>
        </div>
      ) : (
        <p className="text-paper/50 mb-6">No waiter assigned yet — a staff member will be with you shortly.</p>
      )}

      <Link
        href="/menu"
        className="px-5 py-2.5 rounded-full border border-paper/25 text-paper text-sm"
      >
        View Menu &amp; Order
      </Link>
    </main>
  );
}
