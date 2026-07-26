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
    <main className="min-h-screen bg-paper px-6 py-12 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-3">
        <div>
          <p className="ticket-number mb-2">STAFF ACCESS</p>
          <h1 className="font-display text-3xl text-ink">Inventory</h1>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link href="/admin/dashboard" className="px-4 py-2 rounded-full border border-ink/15 text-ink">Dashboard</Link>
          <Link href="/admin/tables" className="px-4 py-2 rounded-full border border-ink/15 text-ink">Tables</Link>
        </nav>
      </div>

      {loading && <p className="text-ink/50">Loading…</p>}

      <div className="space-y-3">
        {ingredients.map((ing, i) => {
          const pct = Math.min(100, (ing.current_stock / (ing.low_stock_threshold * 5)) * 100);
          const low = ing.current_stock <= ing.low_stock_threshold;
          const num = String(i + 1).padStart(2, '0');
          return (
            <div key={ing.id} className="ticket-card p-5 flex items-center justify-between">
              <div className="flex gap-3">
                <span className="ticket-number pt-1">{num}</span>
                <div>
                  <p className="font-medium text-ink">{ing.name}</p>
                  <p className="font-mono-num text-sm text-ink/55 mt-0.5">
                    {ing.current_stock} {ing.unit.toUpperCase()}
                    {low && <span className="ml-2 stamp text-rust">Low</span>}
                  </p>
                  <div className="w-32 h-1.5 bg-ink/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${low ? 'bg-rust' : 'bg-sage'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => adjustStock(ing.id, -0.5, ing.current_stock)}
                  className="w-9 h-9 rounded-full border border-ink/15 text-ink font-mono-num"
                >
                  −
                </button>
                <button
                  onClick={() => adjustStock(ing.id, 1, ing.current_stock)}
                  className="w-9 h-9 rounded-full border border-ink/15 text-ink font-mono-num"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="ticket-number mt-6">
        CHANGES HERE UPDATE MENU AVAILABILITY INSTANTLY
      </p>
    </main>
  );
}
