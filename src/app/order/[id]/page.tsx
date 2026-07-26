'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const STEPS = ['placed', 'confirmed', 'preparing', 'ready', 'served'];

type Order = {
  id: string;
  status: string;
  total_amount: number;
  estimated_ready_time: string;
};

export default function OrderTrackerPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrder();
    const channel = supabase
      .channel(`order-${params.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${params.id}` },
        (payload) => setOrder(payload.new as Order)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [params.id]);

  async function fetchOrder() {
    const { data } = await supabase.from('orders').select('*').eq('id', params.id).single();
    setOrder(data);
  }

  if (!order) return <main className="min-h-screen bg-paper p-10 text-center text-ink/50">Loading order…</main>;

  const currentIndex = STEPS.indexOf(order.status);
  const eta = new Date(order.estimated_ready_time);

  return (
    <main className="min-h-screen bg-paper px-6 py-12 max-w-lg mx-auto">
      <p className="ticket-number mb-2">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
      <h1 className="font-display text-3xl text-ink mb-1">Order status</h1>
      <p className="font-mono-num text-sm text-ink/50 mb-10">TOTAL ₹{order.total_amount}</p>

      <div className="flex justify-between mb-10">
        {STEPS.map((step, i) => (
          <div key={step} className="flex-1 text-center">
            <div
              className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-mono-num font-semibold ${
                i < currentIndex ? 'bg-sage text-white' : i === currentIndex ? 'bg-brass text-coal' : 'bg-ink/10 text-ink/40'
              }`}
            >
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <p className="text-[11px] uppercase tracking-wide text-ink/55">{step}</p>
          </div>
        ))}
      </div>

      <div className="ticket-card p-6 text-center">
        <p className="ticket-number mb-2">ESTIMATED READY</p>
        <p className="font-display text-3xl text-ink">
          {eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </main>
  );
}
