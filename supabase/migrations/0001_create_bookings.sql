-- ===========================================================================
-- BOOKINGS TABLE
-- ===========================================================================
-- Run this once against your Supabase project. Two ways to do it:
--
--   A) Supabase dashboard → SQL Editor → paste this file → Run
--   B) Supabase CLI:  supabase db push
--
-- Everything is idempotent (`if not exists`), so re-running it is harmless.
-- ===========================================================================

create extension if not exists "pgcrypto";       -- gives us gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Booking reference generator: a short, human-friendly code visitors can
-- quote over the phone, e.g. "SYUM-7K2QD4". Ambiguous characters (0/O, 1/I)
-- are deliberately left out of the alphabet.
-- ---------------------------------------------------------------------------
create or replace function public.generate_booking_reference()
returns text
language plpgsql
volatile
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return 'SYUM-' || result;
end;
$$;

-- ---------------------------------------------------------------------------
-- The table itself.
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id                          uuid primary key default gen_random_uuid(),

  -- Shown to the visitor and printed on the admission ticket.
  reference                   text not null unique default public.generate_booking_reference(),

  first_name                  text not null check (char_length(trim(first_name)) between 1 and 60),
  last_name                   text not null check (char_length(trim(last_name)) between 1 and 60),
  phone_country_code          text not null check (phone_country_code ~ '^\+\d{1,4}$'),
  phone                       text not null check (phone ~ '^\d{6,15}$'),
  email                       text not null check (position('@' in email) > 1),

  -- A calendar day with no time zone attached — matches the ISODate strings
  -- used throughout the app. See src/lib/booking/dates.ts for why.
  visit_date                  date not null,
  guests                      integer not null check (guests between 1 and 20),

  referral_source             text not null,

  -- Proof of consent: WHEN the visitor ticked the Terms and Conditions box.
  accepted_terms_at           timestamptz not null default now(),

  -- Which language they booked in, so follow-up emails match.
  locale                      text not null default 'en' check (locale in ('en', 'zh-Hant')),

  status                      text not null default 'confirmed'
                                check (status in ('confirmed', 'cancelled')),

  -- Null until the confirmation email actually goes out. Handy for retries
  -- and for spotting a broken email provider.
  confirmation_email_sent_at  timestamptz,

  created_at                  timestamptz not null default now()
);

-- Counting bookings for one day happens on every submit (the capacity check),
-- so give that query an index.
create index if not exists bookings_visit_date_idx
  on public.bookings (visit_date)
  where status = 'confirmed';

create index if not exists bookings_email_idx on public.bookings (email);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
-- RLS is ON with NO policies, which means: nobody can read or write this table
-- through the public anon key. The only way in is the service_role key, which
-- lives on the server (see src/lib/supabase/server.ts) and bypasses RLS.
--
-- That is the safe default for a table holding visitors' names, phone numbers
-- and email addresses.
--
-- If you later build a staff dashboard, add a policy such as:
--
--   create policy "staff can read bookings"
--     on public.bookings for select
--     to authenticated
--     using (auth.jwt() ->> 'role' = 'museum_staff');
-- ---------------------------------------------------------------------------
alter table public.bookings enable row level security;

-- ---------------------------------------------------------------------------
-- Remaining capacity for a given day. Called by the server before inserting,
-- so two people booking at the same second cannot overfill the museum.
-- ---------------------------------------------------------------------------
create or replace function public.booked_guests_on(target_date date)
returns integer
language sql
stable
as $$
  select coalesce(sum(guests), 0)::int
  from public.bookings
  where visit_date = target_date
    and status = 'confirmed';
$$;
