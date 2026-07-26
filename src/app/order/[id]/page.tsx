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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  async function fetchOrder() {
    const { data } = await supabase.from('orders').select('*').eq('id', params.id).single();
    setOrder(data);
  }

  if (!order) return <main className="p-10 text-center text-ink/50">Loading order…</main>;

  const currentIndex = STEPS.indexOf(order.status);
  const eta = new Date(order.estimated_ready_time);

  return (
    <main className="min-h-screen bg-bg px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-ink mb-2">Order status</h1>
      <p className="text-ink/50 text-sm mb-8">Total: ₹{order.total_amount}</p>

      <div className="flex justify-between mb-8">
        {STEPS.map((step, i) => (
          <div key={step} className="flex-1 text-center relative">
            <div
              className={`w-7 h-7 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-semibold ${
                i < currentIndex
                  ? 'bg-good text-white'
                  : i === currentIndex
                  ? 'bg-accent text-white'
                  : 'bg-ink/10 text-ink/40'
              }`}
            >
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <p className="text-xs capitalize text-ink/60">{step}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-ink/10 rounded-xl p-5 text-center">
        <p className="text-sm text-ink/50 mb-1">Estimated ready by</p>
        <p className="text-xl font-medium text-ink">
          {eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </main>
  );
}
