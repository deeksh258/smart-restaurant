'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  prep_time_minutes: number;
  is_available: boolean;
  image_url: string | null;
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();

    // live updates: when availability changes (stock trigger fires), refetch
    const channel = supabase
      .channel('menu-availability')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'menu_items' },
        () => fetchMenu()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMenu() {
    const { data } = await supabase.from('menu_items').select('*').order('category');
    setItems(data || []);
    setLoading(false);
  }

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <main className="min-h-screen bg-bg px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-ink mb-8">Today's Menu</h1>

      {loading && <p className="text-ink/60">Loading menu…</p>}

      {categories.map((category) => (
        <section key={category} className="mb-10">
          <h2 className="text-lg font-medium text-accent mb-4 uppercase tracking-wide">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items
              .filter((i) => i.category === category)
              .map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 flex justify-between items-start ${
                    item.is_available ? 'border-ink/10 bg-white' : 'border-ink/5 bg-ink/5 opacity-60'
                  }`}
                >
                  <div>
                    <h3 className="font-medium text-ink">{item.name}</h3>
                    <p className="text-sm text-ink/60">{item.description}</p>
                    <p className="text-sm text-ink/50 mt-1">₹{item.price} · {item.prep_time_minutes} min</p>
                  </div>
                  <div>
                    {item.is_available ? (
                      <button className="text-sm px-3 py-1 rounded-full bg-accent text-white">
                        Add
                      </button>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full bg-ink/10 text-ink/50">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
