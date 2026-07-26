'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function BookPage() {
  const [step, setStep] = useState<'form' | 'payment' | 'done'>('form');
  const [size, setSize] = useState(2);
  const [time, setTime] = useState('19:30');
  const [duration, setDuration] = useState(60);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [bookingSummary, setBookingSummary] = useState('');

  async function confirmBooking() {
    setSaving(true);
    try {
      const today = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const bookingTime = new Date(today.setHours(hours, minutes, 0, 0));

      const { error } = await supabase.from('bookings').insert({
        party_size: size,
        booking_time: bookingTime.toISOString(),
        duration_minutes: duration,
        status: 'confirmed',
        advance_amount: 300,
        advance_paid: true,
        email_verified: true,
      });

      if (error) throw error;

      setBookingSummary(
        `Table for ${size} at ${time}, ${duration} min duration. The kitchen has been notified to prep ahead. You'll get a message near the end of your slot to confirm checkout.`
      );
      setStep('done');
    } catch (err) {
      console.error(err);
      alert('Something went wrong confirming your booking.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg px-6 py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold text-ink mb-2">Book a table</h1>
      <p className="text-ink/50 text-sm mb-8">
        A 50% advance and email verification confirm the booking — this protects the kitchen from no-shows.
      </p>

      {step === 'form' && (
        <div className="bg-white border border-ink/10 rounded-xl p-5">
          <label className="text-xs text-ink/50 block mb-1">Party size</label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full mb-4 px-3 py-2 rounded-lg border border-ink/10 bg-bg"
          >
            {[2, 3, 4, 6].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <label className="text-xs text-ink/50 block mb-1">Arrival time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-lg border border-ink/10 bg-bg"
          />

          <label className="text-xs text-ink/50 block mb-1">Meal duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full mb-4 px-3 py-2 rounded-lg border border-ink/10 bg-bg"
          >
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>

          <button
            onClick={() => setStep('payment')}
            className="w-full mt-2 py-2.5 rounded-full bg-accent text-white text-sm font-medium"
          >
            Continue — pay 50% advance
          </button>
        </div>
      )}

      {step === 'payment' && (
        <div className="bg-white border border-ink/10 rounded-xl p-5">
          <h3 className="font-medium text-ink mb-1">Confirm booking</h3>
          <p className="text-xs text-ink/50 mb-4">
            Simulated payment for the hackathon demo — no real transaction occurs.
          </p>

          <label className="text-xs text-ink/50 block mb-1">Advance amount</label>
          <input value="₹300.00" disabled className="w-full mb-4 px-3 py-2 rounded-lg border border-ink/10 bg-bg text-ink/50" />

          <label className="text-xs text-ink/50 block mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full mb-4 px-3 py-2 rounded-lg border border-ink/10 bg-bg"
          />

          <button
            onClick={confirmBooking}
            disabled={saving}
            className="w-full mt-2 py-2.5 rounded-full bg-accent text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Confirming…' : 'Pay & verify email'}
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-white border border-ink/10 rounded-xl p-5">
          <h3 className="font-medium text-good mb-2">Booking confirmed</h3>
          <p className="text-sm text-ink/60">{bookingSummary}</p>
        </div>
      )}
    </main>
  );
}
