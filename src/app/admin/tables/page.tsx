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

  const statusStyle: Record<string, string> = {
    vacant: 'bg-sage-soft text-sage',
    occupied: 'bg-rust-soft text-rust',
    reserved: 'bg-brass-soft text-brass',
    needs_cleaning: 'bg-ink/10 text-ink/50',
  };

  return (
    <main className="min-h-screen bg-paper px-6 py-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-3">
        <div>
          <p className="ticket-number mb-2">STAFF ACCESS</p>
          <h1 className="font-display text-3xl text-ink">Tables</h1>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link href="/admin/dashboard" className="px-4 py-2 rounded-full border border-ink/15 text-ink">Dashboard</Link>
          <Link href="/admin/inventory" className="px-4 py-2 rounded-full border border-ink/15 text-ink">Inventory</Link>
        </nav>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tables.map((t) => (
          <div key={t.id} className="ticket-card p-5 text-center">
            <p className="font-display text-3xl text-ink">{t.table_number}</p>
            <span className={`stamp mt-2 mb-3 ${statusStyle[t.status] || 'bg-ink/5 text-ink/50'}`}>
              {t.status}
            </span>
            <p className="font-mono-num text-xs text-ink/45 mb-3">{t.seats} SEATS</p>
            <select
              value={t.assigned_waiter_id || ''}
              onChange={(e) => reassignWaiter(t.id, e.target.value)}
              className="text-xs w-full px-2 py-2 rounded-lg border border-ink/15 bg-paper"
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
