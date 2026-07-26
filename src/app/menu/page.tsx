'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  prep_time_minutes: number;
  is_available: boolean;
};

export default function MenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchMenu();
    const channel = supabase
      .channel('menu-availability')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, () => fetchMenu())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchMenu() {
    const { data, error } = await supabase.from('menu_items').select('*').order('category');
    if (error) console.error(error);
    setItems(data || []);
    setLoading(false);
  }

  function addToCart(item: MenuItem) {
    setCart((prev) => [...prev, item]);
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  async function placeOrder() {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const total = cart.reduce((sum, i) => sum + i.price, 0);
      const maxPrep = Math.max(...cart.map((i) => i.prep_time_minutes));
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['placed', 'confirmed', 'preparing']);
      const etaMinutes = maxPrep + (count || 0) * 3;
      const estimatedReadyTime = new Date(Date.now() + etaMinutes * 60000).toISOString();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ total_amount: total, estimated_ready_time: estimatedReadyTime })
        .select()
        .single();
      if (orderError) throw orderError;

      const orderItemRows = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: 1,
        price_at_order: item.price,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemRows);
      if (itemsError) throw itemsError;

      router.push(`/order/${order.id}`);
    } catch (err) {
      console.error(err);
      alert('Something went wrong placing your order. Please try again.');
      setPlacing(false);
    }
  }

  const categories = [...new Set(items.map((i) => i.category))];
  let itemCounter = 0;

  return (
    <main className="min-h-screen bg-paper px-6 py-12 max-w-3xl mx-auto pb-32">
      <p className="ticket-number mb-2">TODAY'S SERVICE</p>
      <h1 className="font-display text-4xl text-ink mb-10">Menu</h1>

      {loading && <p className="text-ink/50">Loading menu…</p>}

      {categories.map((category) => (
        <section key={category} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-semibold text-brass uppercase tracking-widest">{category}</h2>
            <div className="flex-1 h-px bg-ink/10" />
          </div>
          <div className="space-y-3">
            {items
              .filter((i) => i.category === category)
              .map((item) => {
                itemCounter += 1;
                const num = String(itemCounter).padStart(2, '0');
                return (
                  <div
                    key={item.id}
                    className={`ticket-card p-4 flex justify-between items-start ${!item.is_available ? 'opacity-50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <span className="ticket-number pt-1">{num}</span>
                      <div>
                        <h3 className="font-medium text-ink">{item.name}</h3>
                        <p className="text-sm text-ink/55">{item.description}</p>
                        <p className="font-mono-num text-xs text-ink/45 mt-1.5">
                          ₹{item.price} · {item.prep_time_minutes} MIN
                        </p>
                      </div>
                    </div>
                    <div>
                      {item.is_available ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="text-sm px-4 py-1.5 rounded-full bg-brass text-coal font-medium"
                        >
                          Add
                        </button>
                      ) : (
                        <span className="stamp text-rust">Sold Out</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      ))}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-coal text-paper px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap flex-1">
              {cart.map((item, i) => (
                <span
                  key={i}
                  onClick={() => removeFromCart(i)}
                  className="text-xs px-3 py-1 rounded-full bg-paper/10 cursor-pointer font-mono-num"
                  title="Click to remove"
                >
                  {item.name} ✕
                </span>
              ))}
            </div>
            <button
              onClick={placeOrder}
              disabled={placing}
              className="px-5 py-2.5 rounded-full bg-brass text-coal text-sm font-semibold whitespace-nowrap disabled:opacity-50"
            >
              {placing ? 'Placing…' : `Place order · ₹${cart.reduce((s, i) => s + i.price, 0)}`}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
