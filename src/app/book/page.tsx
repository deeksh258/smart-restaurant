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
    <main className="min-h-screen bg-paper px-6 py-12 max-w-md mx-auto">
      <p className="ticket-number mb-2">RESERVATION</p>
      <h1 className="font-display text-3xl text-ink mb-2">Book a table</h1>
      <p className="text-ink/55 text-sm mb-8 leading-relaxed">
        A 50% advance and email verification confirm the booking — this protects the kitchen from no-shows.
      </p>

      {step === 'form' && (
        <div className="ticket-card p-6">
          <label className="ticket-number block mb-1">PARTY SIZE</label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full mb-4 px-3 py-2.5 rounded-lg border border-ink/12 bg-paper text-sm"
          >
            {[2, 3, 4, 6].map((n) => <option key={n} value={n}>{n} guests</option>)}
          </select>

          <label className="ticket-number block mb-1">ARRIVAL TIME</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full mb-4 px-3 py-2.5 rounded-lg border border-ink/12 bg-paper text-sm"
          />

          <label className="ticket-number block mb-1">MEAL DURATION</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full mb-5 px-3 py-2.5 rounded-lg border border-ink/12 bg-paper text-sm"
          >
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>

          <button
            onClick={() => setStep('payment')}
            className="w-full py-3 rounded-full bg-brass text-coal text-sm font-semibold"
          >
            Continue — pay 50% advance
          </button>
        </div>
      )}

      {step === 'payment' && (
        <div className="ticket-card p-6">
          <h3 className="font-display text-xl text-ink mb-1">Confirm booking</h3>
          <p className="text-xs text-ink/50 mb-5">
            Simulated payment for the hackathon demo — no real transaction occurs.
          </p>

          <label className="ticket-number block mb-1">ADVANCE AMOUNT</label>
          <input value="₹300.00" disabled className="font-mono-num w-full mb-4 px-3 py-2.5 rounded-lg border border-ink/12 bg-ink/5 text-ink/50 text-sm" />

          <label className="ticket-number block mb-1">EMAIL</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full mb-5 px-3 py-2.5 rounded-lg border border-ink/12 bg-paper text-sm"
          />

          <button
            onClick={confirmBooking}
            disabled={saving}
            className="w-full py-3 rounded-full bg-brass text-coal text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Confirming…' : 'Pay & verify email'}
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="ticket-card p-6">
          <span className="stamp text-sage mb-3">Confirmed</span>
          <p className="text-sm text-ink/65 mt-3 leading-relaxed">{bookingSummary}</p>
        </div>
      )}
    </main>
  );
}
