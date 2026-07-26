import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-coal text-paper flex flex-col items-center justify-center px-6 text-center">
      <p className="ticket-number mb-3">ODD THINKER · EST. 2026</p>
      <h1 className="font-display text-6xl mb-4">Tavola</h1>
      <p className="text-paper/60 max-w-md mb-10 leading-relaxed">
        Stock runs out, the menu knows. Guests confirm, the kitchen preps ahead.
        One waiter per table, always reachable.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/menu" className="px-6 py-3 rounded-full bg-brass text-coal text-sm font-semibold">
          View Menu
        </Link>
        <Link href="/book" className="px-6 py-3 rounded-full border border-paper/25 text-paper text-sm">
          Book a Table
        </Link>
        <Link href="/admin/dashboard" className="px-6 py-3 rounded-full border border-paper/25 text-paper text-sm">
          Staff Login
        </Link>
      </div>
    </main>
  );
}
