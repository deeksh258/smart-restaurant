import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-wide text-accent mb-2">Odd Thinker</p>
      <h1 className="text-4xl font-semibold text-ink mb-3">Tavola</h1>
      <p className="text-ink/60 max-w-md mb-8">
        A smart restaurant platform — live menu availability, no-show-proof
        bookings, and one waiter per table, always reachable.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/menu" className="px-5 py-2.5 rounded-full bg-accent text-white text-sm">
          View Menu
        </Link>
        <Link href="/book" className="px-5 py-2.5 rounded-full border border-ink/20 text-ink text-sm">
          Book a Table
        </Link>
        <Link href="/admin/dashboard" className="px-5 py-2.5 rounded-full border border-ink/20 text-ink text-sm">
          Staff Login
        </Link>
      </div>
    </main>
  );
}
