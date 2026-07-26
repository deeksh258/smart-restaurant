# Smart Restaurant Management System — VibeAthon 6.0

An inventory-aware restaurant platform: stock updates automatically control menu
availability, bookings require confirmation to reduce no-shows, and each table's
QR code connects customers directly to their assigned waiter.

## Team Name
_(fill in)_

## Tech Stack
- Frontend: Next.js 14 (App Router) + Tailwind CSS
- Backend / DB: Supabase (Postgres + Auth + Realtime)
- Auth: Supabase Auth (Email/OTP + Google OAuth)
- Charts: Recharts
- Deployment: Vercel

## User Stories Completed
- [ ] US1 — Modern UI (Bronze)
- [ ] US2 — Auth (Silver)
- [ ] US3 — Digital menu, availability, reservations, ordering (Silver)
- [ ] US4 — Management dashboard (Gold)
- [ ] US5 — Intelligent features: auto-availability, ETA, forecasting (Platinum)

## AI Usage
_(Document any AI tools used to build this — Claude, Gemini API for features, etc.)_

## Setup

1. **Create a Supabase project** at supabase.com

2. **Run the schema**
   Open the SQL editor in your Supabase dashboard and run `supabase/schema.sql`.
   This creates all tables plus two key triggers:
   - `trg_deduct_stock` — deducts ingredient stock whenever an order item is placed
   - `trg_refresh_availability` — auto-flips a dish to unavailable when any
     required ingredient drops below what's needed for one serve

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase project URL and anon key (Project Settings → API).

4. **Install and run**
   ```bash
   npm install
   npm run dev
   ```
   App runs at http://localhost:3000

## Core Mechanic: Inventory-Driven Availability

1. Manager enters stock in the Inventory page (e.g. "Rice: 5kg")
2. Each dish has a recipe (`dish_ingredients`) — e.g. "Veg Biryani uses 0.3kg rice/serve"
3. When an order is placed, a Postgres trigger deducts stock automatically
4. A second trigger recalculates `is_available` on any dish using that ingredient
5. The menu page listens via Supabase Realtime and updates instantly —
   no manual "mark unavailable" step required

See `dish_serves_remaining` view in `schema.sql` for a live "X serves left" query,
useful for the "Only 2 left!" badge and low-stock alerts.

## Project Structure
```
src/
  app/
    menu/            → customer menu with live availability
    book/             → table booking + simulated advance payment
    table/[id]/       → QR landing page (waiter info, call button)
    admin/
      dashboard/      → analytics overview
      inventory/      → stock management
      tables/         → table + waiter assignment
  lib/
    supabase.ts       → Supabase client
    restaurant.ts     → ETA calc, order placement, booking confirmation logic
supabase/
  schema.sql          → full DB schema + triggers
```

## Hosted Application Link
_(fill in after deployment)_
