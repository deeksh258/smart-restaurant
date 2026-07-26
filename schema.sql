-- ============================================================
-- Smart Restaurant Management System - Supabase Schema
-- VibeAthon 6.0
-- ============================================================

-- ---------- ENUMS ----------
create type user_role as enum ('customer', 'manager', 'waiter', 'kitchen');
create type table_status as enum ('vacant', 'reserved', 'occupied', 'needs_cleaning');
create type booking_status as enum ('pending_payment', 'confirmed', 'seated', 'awaiting_checkout_confirm', 'completed', 'no_show', 'cancelled');
create type order_status as enum ('placed', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');

-- ---------- PROFILES (extends Supabase auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'customer',
  email_verified boolean default false,
  created_at timestamptz default now()
);

-- ---------- STAFF ----------
create table staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  role user_role not null, -- waiter, manager, kitchen
  photo_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ---------- RESTAURANT TABLES ----------
create table restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  table_number int not null unique,
  seats int not null default 4,
  status table_status not null default 'vacant',
  assigned_waiter_id uuid references staff(id),
  qr_code_url text,
  -- occupancy / duration tracking
  occupied_at timestamptz,
  expected_duration_minutes int default 60,
  expected_end_time timestamptz,
  checkout_confirmation_sent boolean default false,
  created_at timestamptz default now()
);

-- ---------- INGREDIENTS (core inventory engine) ----------
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- e.g. "Rice"
  unit text not null,                 -- e.g. "kg", "litre", "pcs"
  current_stock numeric not null default 0,
  low_stock_threshold numeric default 1,
  updated_at timestamptz default now()
);

-- ---------- MENU ITEMS ----------
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,                      -- starters / main / dessert / beverages
  price numeric not null,
  prep_time_minutes int not null default 15,
  image_url text,
  is_available boolean default true,  -- auto-computed, but stored for fast reads
  created_at timestamptz default now()
);

-- Recipe: how much of each ingredient one serve of a dish consumes
create table dish_ingredients (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references menu_items(id) on delete cascade,
  ingredient_id uuid references ingredients(id) on delete cascade,
  quantity_per_serve numeric not null, -- e.g. 0.2 (kg of rice per plate)
  unique (menu_item_id, ingredient_id)
);

-- ---------- BOOKINGS ----------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  table_id uuid references restaurant_tables(id),
  party_size int not null,
  booking_time timestamptz not null,       -- expected arrival
  duration_minutes int default 60,
  status booking_status not null default 'pending_payment',
  advance_amount numeric,
  advance_paid boolean default false,
  email_verified boolean default false,
  pre_order_item_ids uuid[],                -- optional pre-ordered dishes
  created_at timestamptz default now()
);

-- ---------- ORDERS ----------
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  table_id uuid references restaurant_tables(id),
  booking_id uuid references bookings(id),
  status order_status not null default 'placed',
  total_amount numeric default 0,
  estimated_ready_time timestamptz,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  quantity int not null default 1,
  price_at_order numeric not null
);

-- ---------- NOTIFICATIONS (simulated SMS/email log) ----------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references profiles(id),
  type text not null,          -- 'booking_confirmation', 'checkout_check', 'low_stock', etc.
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- CORE LOGIC: auto-update dish availability when stock changes
-- ============================================================
create or replace function refresh_menu_availability()
returns trigger as $$
begin
  update menu_items mi
  set is_available = (
    not exists (
      select 1
      from dish_ingredients di
      join ingredients ing on ing.id = di.ingredient_id
      where di.menu_item_id = mi.id
      and ing.current_stock < di.quantity_per_serve
    )
  )
  where mi.id in (
    select menu_item_id from dish_ingredients where ingredient_id = new.id
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_refresh_availability
after update of current_stock on ingredients
for each row execute function refresh_menu_availability();

-- ============================================================
-- CORE LOGIC: deduct ingredient stock when an order item is placed
-- ============================================================
create or replace function deduct_stock_on_order()
returns trigger as $$
begin
  update ingredients ing
  set current_stock = ing.current_stock - (di.quantity_per_serve * new.quantity),
      updated_at = now()
  from dish_ingredients di
  where di.ingredient_id = ing.id
  and di.menu_item_id = new.menu_item_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_deduct_stock
after insert on order_items
for each row execute function deduct_stock_on_order();

-- ============================================================
-- HELPER VIEW: how many serves remain per dish right now
-- ============================================================
create view dish_serves_remaining as
select
  mi.id as menu_item_id,
  mi.name,
  min(floor(ing.current_stock / di.quantity_per_serve)) as serves_remaining
from menu_items mi
join dish_ingredients di on di.menu_item_id = mi.id
join ingredients ing on ing.id = di.ingredient_id
group by mi.id, mi.name;

-- ============================================================
-- Enable Row Level Security (basic policies - tighten before real deploy)
-- ============================================================
alter table profiles enable row level security;
alter table bookings enable row level security;
alter table orders enable row level security;

create policy "profiles_self_access" on profiles for all using (auth.uid() = id);
create policy "bookings_owner_access" on bookings for all using (auth.uid() = customer_id);
create policy "orders_owner_access" on orders for all using (auth.uid() = customer_id);

-- Menu/ingredients/tables are publicly readable, writable only by staff
alter table menu_items enable row level security;
create policy "menu_public_read" on menu_items for select using (true);
