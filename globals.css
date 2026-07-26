'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type TableRow = {
  id: string;
  table_number: number;
  seats: number;
  status: string;
  assigned_waiter_id: string | null;
};

type Staff = { id: string; name: string };

export default function TablesPage() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: tableData } = await supabase
      .from('restaurant_tables')
      .select('*')
      .order('table_number');
    const { data: staffData } = await supabase.from('staff').select('id, name');
    setTables(tableData || []);
    setStaff(staffData || []);
  }

  async function reassignWaiter(tableId: string, waiterId: string) {
    const { error } = await supabase
      .from('restaurant_tables')
      .update({ assigned_waiter_id: waiterId })
      .eq('id', tableId);
    if (error) {
      console.error(error);
      return;
    }
    fetchData();
  }

  function waiterName(id: string | null) {
    return staff.find((s) => s.id === id)?.name || 'Unassigned';
  }

  const statusColor: Record<string, string> = {
    vacant: 'bg-sage-soft',
    occupied: 'bg-brick-soft',
    reserved: 'bg-mustard-soft',
    needs_cleaning: 'bg-ink/10',
  };

  return (
    <main className="min-h-screen bg-bg px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-accent mb-1">Staff</p>
          <h1 className="text-2xl font-semibold text-ink">Tables</h1>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link href="/admin/dashboard" className="px-3 py-1.5 rounded-full border border-ink/15">Dashboard</Link>
          <Link href="/admin/inventory" className="px-3 py-1.5 rounded-full border border-ink/15">Inventory</Link>
        </nav>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tables.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl border border-ink/10 p-4 text-center ${statusColor[t.status] || 'bg-white'}`}
          >
            <p className="text-2xl font-semibold text-ink">{t.table_number}</p>
            <p className="text-xs uppercase text-ink/50 mb-2">{t.status} · {t.seats} seats</p>
            <select
              value={t.assigned_waiter_id || ''}
              onChange={(e) => reassignWaiter(t.id, e.target.value)}
              className="text-xs w-full px-2 py-1 rounded-lg border border-ink/15 bg-white"
            >
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </main>
  );
}
