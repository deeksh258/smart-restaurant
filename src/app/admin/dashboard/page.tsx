'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    revenueToday: 0,
    ordersToday: 0,
    occupiedTables: 0,
    totalTables: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', todayStart.toISOString());
    const { data: tables } = await supabase.from('restaurant_tables').select('status');
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('current_stock, low_stock_threshold');

    setMetrics({
      revenueToday: (orders || []).reduce((s, o) => s + Number(o.total_amount), 0),
      ordersToday: (orders || []).length,
      occupiedTables: (tables || []).filter((t) => t.status === 'occupied').length,
      totalTables: (tables || []).length,
      lowStockCount: (ingredients || []).filter(
        (i) => Number(i.current_stock) <= Number(i.low_stock_threshold)
      ).length,
    });
  }

  const cards = [
    { label: 'Revenue today', value: `₹${metrics.revenueToday}` },
    { label: 'Orders today', value: metrics.ordersToday },
    { label: 'Occupied tables', value: `${metrics.occupiedTables}/${metrics.totalTables}` },
    { label: 'Low stock items', value: metrics.lowStockCount, alert: metrics.lowStockCount > 0 },
  ];

  return (
    <main className="min-h-screen bg-paper px-6 py-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-3">
        <div>
          <p className="ticket-number mb-2">STAFF ACCESS</p>
          <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link href="/admin/inventory" className="px-4 py-2 rounded-full border border-ink/15 text-ink">Inventory</Link>
          <Link href="/admin/tables" className="px-4 py-2 rounded-full border border-ink/15 text-ink">Tables</Link>
        </nav>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="ticket-card p-5">
            <p className="ticket-number mb-2">{c.label.toUpperCase()}</p>
            <p className={`font-display text-3xl ${c.alert ? 'text-rust' : 'text-ink'}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
