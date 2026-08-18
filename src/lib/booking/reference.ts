/**
 * Generates a booking reference like "SYUM-7K2QD4".
 *
 * Normally Postgres does this (see `generate_booking_reference()` in
 * `supabase/migrations/0001_create_bookings.sql`) so the uniqueness constraint
 * can enforce it. This copy exists only for the development fallback in
 * `actions.ts`, which runs when no Supabase project is configured yet.
 *
 * The alphabet deliberately leaves out 0/O and 1/I so nobody misreads a
 * reference over the phone.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBookingReference(): string {
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `SYUM-${code}`;
}
