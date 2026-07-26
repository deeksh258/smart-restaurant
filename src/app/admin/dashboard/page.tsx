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

  return (
    <main className="min-h-screen bg-bg px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-accent mb-1">Staff</p>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link href="/admin/inventory" className="px-3 py-1.5 rounded-full border border-ink/15">Inventory</Link>
          <Link href="/admin/tables" className="px-3 py-1.5 rounded-full border border-ink/15">Tables</Link>
        </nav>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-ink/10 rounded-xl p-4">
          <p className="text-xs text-ink/50 uppercase">Revenue today</p>
          <p className="text-2xl font-semibold text-ink mt-1">₹{metrics.revenueToday}</p>
        </div>
        <div className="bg-white border border-ink/10 rounded-xl p-4">
          <p className="text-xs text-ink/50 uppercase">Orders today</p>
          <p className="text-2xl font-semibold text-ink mt-1">{metrics.ordersToday}</p>
        </div>
        <div className="bg-white border border-ink/10 rounded-xl p-4">
          <p className="text-xs text-ink/50 uppercase">Occupied tables</p>
          <p className="text-2xl font-semibold text-ink mt-1">
            {metrics.occupiedTables}/{metrics.totalTables}
          </p>
        </div>
        <div className="bg-white border border-ink/10 rounded-xl p-4">
          <p className="text-xs text-ink/50 uppercase">Low stock items</p>
          <p className="text-2xl font-semibold text-ink mt-1">{metrics.lowStockCount}</p>
        </div>
      </div>
    </main>
  );
}
