'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Ingredient = {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  low_stock_threshold: number;
};

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIngredients();
  }, []);

  async function fetchIngredients() {
    const { data } = await supabase.from('ingredients').select('*').order('name');
    setIngredients(data || []);
    setLoading(false);
  }

  async function adjustStock(id: string, delta: number, current: number) {
    const newStock = Math.max(0, +(current + delta).toFixed(2));
    const { error } = await supabase
      .from('ingredients')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error(error);
      alert('Failed to update stock.');
      return;
    }
    fetchIngredients();
  }

  return (
    <main className="min-h-screen bg-bg px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-accent mb-1">Staff</p>
          <h1 className="text-2xl font-semibold text-ink">Inventory</h1>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link href="/admin/dashboard" className="px-3 py-1.5 rounded-full border border-ink/15">Dashboard</Link>
          <Link href="/admin/tables" className="px-3 py-1.5 rounded-full border border-ink/15">Tables</Link>
        </nav>
      </div>

      {loading && <p className="text-ink/50">Loading…</p>}

      <div className="bg-white border border-ink/10 rounded-xl divide-y divide-ink/5">
        {ingredients.map((ing) => {
          const pct = Math.min(100, (ing.current_stock / (ing.low_stock_threshold * 5)) * 100);
          const low = ing.current_stock <= ing.low_stock_threshold;
          return (
            <div key={ing.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-ink">{ing.name}</p>
                <p className="text-sm text-ink/50">
                  {ing.current_stock} {ing.unit}
                  {low && <span className="ml-2 text-warn font-medium">Low stock</span>}
                </p>
                <div className="w-32 h-1.5 bg-ink/10 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full ${low ? 'bg-warn' : 'bg-good'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => adjustStock(ing.id, -0.5, ing.current_stock)}
                  className="w-8 h-8 rounded-full border border-ink/15 text-ink"
                >
                  −
                </button>
                <button
                  onClick={() => adjustStock(ing.id, 1, ing.current_stock)}
                  className="w-8 h-8 rounded-full border border-ink/15 text-ink"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink/40 mt-4">
        Changes here update the customer menu's availability instantly via the database trigger.
      </p>
    </main>
  );
}
