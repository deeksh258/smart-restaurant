import { supabase } from './supabase';

/**
 * Simple rule-based ETA: prep time of the slowest dish in the order
 * plus a small buffer per item already queued ahead of it.
 */
export async function calculateETA(orderItems: { menu_item_id: string; quantity: number }[]) {
  const ids = orderItems.map((i) => i.menu_item_id);
  const { data: dishes } = await supabase
    .from('menu_items')
    .select('id, prep_time_minutes')
    .in('id', ids);

  const maxPrepTime = Math.max(...(dishes?.map((d) => d.prep_time_minutes) || [15]));

  // count currently active orders (queue ahead of this one)
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['placed', 'confirmed', 'preparing']);

  const queueBufferMinutes = (count || 0) * 3; // ~3 min added per order ahead in queue
  return maxPrepTime + queueBufferMinutes;
}

/**
 * Places an order. Stock deduction + availability refresh happen automatically
 * via Postgres triggers defined in schema.sql.
 */
export async function placeOrder(params: {
  customerId: string;
  tableId?: string;
  bookingId?: string;
  items: { menu_item_id: string; quantity: number; price: number }[];
}) {
  const total = params.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const etaMinutes = await calculateETA(params.items);
  const estimatedReadyTime = new Date(Date.now() + etaMinutes * 60000).toISOString();

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_id: params.customerId,
      table_id: params.tableId,
      booking_id: params.bookingId,
      total_amount: total,
      estimated_ready_time: estimatedReadyTime,
    })
    .select()
    .single();

  if (error) throw error;

  const orderItemRows = params.items.map((i) => ({
    order_id: order.id,
    menu_item_id: i.menu_item_id,
    quantity: i.quantity,
    price_at_order: i.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemRows);
  if (itemsError) throw itemsError;

  return { order, estimatedReadyTime };
}

/**
 * Confirms a booking once advance payment (simulated) and email verification
 * are both done. Also assigns expected_end_time on the table for auto-vacate flow.
 */
export async function confirmBooking(bookingId: string) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId);

  if (booking.table_id) {
    const expectedEnd = new Date(
      new Date(booking.booking_time).getTime() + (booking.duration_minutes || 60) * 60000
    ).toISOString();

    await supabase
      .from('restaurant_tables')
      .update({ status: 'reserved', expected_end_time: expectedEnd })
      .eq('id', booking.table_id);
  }
}

/**
 * Called by a scheduled job (Supabase cron / edge function) that checks
 * every few minutes for tables whose expected_end_time has passed and
 * sends a checkout confirmation notification.
 */
export async function checkOverdueTables() {
  const now = new Date().toISOString();
  const { data: tables } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('status', 'occupied')
    .lt('expected_end_time', now)
    .eq('checkout_confirmation_sent', false);

  for (const table of tables || []) {
    await supabase.from('notifications').insert({
      type: 'checkout_check',
      message: `Are you done with your meal at Table ${table.table_number}? Reply to confirm.`,
    });

    await supabase
      .from('restaurant_tables')
      .update({ checkout_confirmation_sent: true })
      .eq('id', table.id);
  }
}
