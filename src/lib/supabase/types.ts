/**
 * The shape of the `bookings` table, mirroring
 * `supabase/migrations/0001_create_bookings.sql`.
 *
 * Keeping this by hand is fine for one table. Once the schema grows, generate
 * it instead:  npx supabase gen types typescript --project-id <id> > types.ts
 */
export type BookingRow = {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  phone_country_code: string;
  phone: string;
  email: string;
  visit_date: string; // "YYYY-MM-DD"
  guests: number;
  referral_source: string;
  accepted_terms_at: string; // ISO timestamp
  locale: string;
  status: "confirmed" | "cancelled";
  confirmation_email_sent_at: string | null;
  created_at: string;
};

/** The columns we supply on insert; the rest have database defaults. */
export type BookingInsert = Omit<
  BookingRow,
  "id" | "created_at" | "status" | "confirmation_email_sent_at"
>;
