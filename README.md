# Shue Yan University History Museum — website

A bilingual (English / Traditional Chinese), WCAG 2.2 Level AA website for the
SYU History Museum, with an on-site visit booking system.

Built with **Next.js 15 (App Router)**, **Tailwind CSS** and **Supabase**.

Two pages are built from the official designs:

| Page | Route | Design source |
| --- | --- | --- |
| Home | `/` | `SYU_Museum_Website_Home_Page_&_Registration_Page.pdf` |
| Exhibition Visit Booking | `/book` | `SYUM_Website_Booking_Pages.docx` + the same PDF |

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

**It works straight away with no configuration.** Until you add a Supabase
project, submitting a booking runs the whole flow — validation, the
confirmation screen, the reference code — and prints the confirmation email to
your terminal instead of saving or sending anything. That fallback is disabled
in production builds, so a real visitor can never be told a booking succeeded
when it did not.

When you are ready for real data, copy `.env.example` to `.env.local` and fill
it in — see [Supabase setup](#supabase-setup) and [Email setup](#email-setup).

### The commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint, including the `jsx-a11y` accessibility rules |
| `npm run typecheck` | TypeScript, no build output |
| `npm run check:validation` | Proves every booking error message maps to a real dictionary key |
| `npm run check` | All three of the above |

---

## Where everything lives

```
src/
├── app/                        Routes (App Router)
│   ├── layout.tsx              <html lang>, fonts, metadata
│   ├── page.tsx                HOME PAGE
│   ├── book/page.tsx           BOOKING PAGE
│   ├── about|visit|collection|events|materials/
│   │                           Placeholder routes, so no link is dead
│   ├── icon.svg                Favicon
│   └── globals.css             Base styles, focus ring, reduced-motion rules
│
├── components/
│   ├── layout/                 Header, footer, skip link, the two bars
│   ├── home/                   Hero, welcome section, the three cards
│   ├── booking/                The whole booking flow (see below)
│   └── ui/                     Button / ButtonLink, Field, input styling
│
├── config/site.ts              ⭐ ALL museum data: hours, address, nav,
│                                  booking rules, dropdown options
│
└── lib/
    ├── i18n/                   Language detection + dictionaries
    │   ├── config.ts           Locales, cookie name
    │   ├── index.ts            getLocale() / getDictionary()
    │   └── dictionaries/       ⭐ ALL user-visible text (en.ts, zh-Hant.ts)
    ├── booking/
    │   ├── dates.ts            Date rules (shared by browser and server)
    │   ├── schema.ts           Zod validation (shared by browser and server)
    │   ├── messages.ts         Error key → translated sentence
    │   ├── actions.ts          ⭐ createBooking() — the Server Action
    │   └── reference.ts        Booking reference generator (dev fallback only)
    ├── email/
    │   ├── send.ts             Chooses console / Resend / Edge Function
    │   └── templates/          The confirmation email (HTML + plain text)
    └── supabase/server.ts      Server-only Supabase client

supabase/
├── migrations/0001_create_bookings.sql     The bookings table + RLS
└── functions/send-booking-confirmation/    Optional Edge Function

scripts/check-validation.ts                 Validation self-check
```

### The two files you will edit most

* **`src/config/site.ts`** — opening hours, address, capacity, party-size
  limits, the referral dropdown options, the navigation links.
* **`src/lib/i18n/dictionaries/en.ts`** — every word the visitor reads,
  including the Terms and Conditions.

Nothing user-visible is hard-coded inside a component.

---

## How the booking flow works

```
  /book
    │
    ├── Step 1  GuestDetailsStep   name · phone · email · date · guests · referral
    │             │  "Next"  → validates step 1's fields only
    │             ▼
    ├── Step 2  ReviewStep         read-only summary + Terms and Conditions
    │             │  "Submit" → validates everything, calls createBooking()
    │             ▼
    └── Step 3  SuccessStep        booking reference + admission ticket
```

`BookingFlow.tsx` holds the state; the three steps are presentational. Going
back never loses what was typed.

**On submit**, `createBooking()` (a Server Action in `lib/booking/actions.ts`):

1. **Re-validates everything** with the same Zod schema the browser used. The
   browser check is a courtesy; this is the one that protects the data.
2. **Checks capacity** for that date via the `booked_guests_on()` SQL function,
   so two people booking at the same moment cannot overfill the museum.
3. **Inserts the booking**; Postgres mints the reference (`SYUM-7K2QD4`).
4. **Sends the confirmation email**, then stamps `confirmation_email_sent_at`.
5. **Returns** either the reference, or errors keyed by field name.

It never throws — a failure comes back as a result the form can render.

### Booking rules

All in `BOOKING_RULES` and `OPENING_HOURS` in `src/config/site.ts`:

* 1–20 guests per booking
* at least 1 day's notice, at most 180 days ahead
* Mondays are unselectable, because `OPENING_HOURS` marks Monday closed —
  the calendar and the opening hours can never disagree
* 120 visitors per day (set `dailyCapacity: null` to switch the check off)

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration — either paste
   `supabase/migrations/0001_create_bookings.sql` into the dashboard's
   **SQL Editor**, or run `supabase db push` with the CLI.
3. Copy your keys from **Project Settings → API** into `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### A note on security

The `bookings` table has **Row Level Security on with no policies**. That means
the public `anon` key cannot read or write it at all — the only way in is the
`service_role` key, which lives on the server.

This matters because the table holds visitors' names, phone numbers and email
addresses.

* `SUPABASE_SERVICE_ROLE_KEY` must **never** be renamed to `NEXT_PUBLIC_*`.
  Anything with that prefix is compiled into the browser bundle.
* `src/lib/supabase/server.ts` starts with `import "server-only"`, so if
  anyone ever imports it from a Client Component by mistake, **the build fails**
  instead of shipping the key to the browser.

When you build a staff dashboard later, add a policy rather than loosening
this — there is a commented example at the bottom of the migration.

---

## Email setup

The confirmation email is built in
`src/lib/email/templates/booking-confirmation.ts` (HTML **and** plain text,
both languages) and sent by `src/lib/email/send.ts`.

Choose a transport with `EMAIL_TRANSPORT` in `.env.local`:

### `console` — the default while developing

Prints the email to your terminal. No account, no key, no cost.

### `resend` — the simplest real option

1. Sign up at [resend.com](https://resend.com) (the free tier is plenty).
2. Add to `.env.local`:

   ```bash
   EMAIL_TRANSPORT=resend
   RESEND_API_KEY=re_xxxxxxxx
   EMAIL_FROM="SYU History Museum <onboarding@resend.dev>"
   ```

   `onboarding@resend.dev` is Resend's sandbox sender — it can only deliver to
   your own account's address. Verify the museum's domain in the Resend
   dashboard, then change `EMAIL_FROM` to something like
   `museum@hksyu.edu` before going live.

### `edge-function` — keep email inside Supabase

Use this if you would rather email be handled by your backend than by Next.js.

```bash
supabase secrets set RESEND_API_KEY=re_xxx EMAIL_FROM="SYU History Museum <museum@your-domain>"
supabase functions deploy send-booking-confirmation
```

Then set `EMAIL_TRANSPORT=edge-function` in `.env.local`.

### If the email fails

The booking is still saved, and the confirmation screen says so and shows the
museum's contact address. Losing a confirmed booking because an email provider
had a bad minute would be far worse than a delayed email.

---

## Adding Traditional Chinese

The plumbing is done — only the words are missing.

1. Open `src/lib/i18n/dictionaries/en.ts` and copy a key you want to translate.
2. Paste it into `zh-Hant.ts` and replace the English with Chinese.
3. Save.

That is the whole job. **Any key you have not translated yet falls back to
English automatically**, so you can do it a section at a time and the site is
never broken. The nav, footer, headings and field labels are already done as a
worked example.

### How the language is chosen

1. The cookie set by the 中 / Eng buttons — an explicit choice always wins.
2. The browser's `Accept-Language` header — this is the "follow the device
   language" behaviour, and it already works today.
3. English.

Server Components call `getTranslation()` and pass the finished `dict` object
down as a plain prop. There is no provider to wire up and no context to import.

If the museum later needs `/en/...` and `/zh/...` URLs for SEO, move to a
Next.js `[locale]` route segment — the dictionaries and components will not
need to change.

---

## Accessibility

The target is **WCAG 2.2 Level AA**. See
[`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) for the full list of what was
done and how it was verified, including the automated audit results.

The short version:

* Every colour pair in `tailwind.config.ts` is contrast-checked, with the
  measured ratio written next to it.
* Full keyboard support, including a proper ARIA date grid with arrow-key
  navigation and a roving tabindex.
* A skip link, correct landmarks, and headings that never skip a level.
* Errors appear in a focused summary box at the top of the form **and** next to
  the field, always with an icon and words — never colour alone.
* `prefers-reduced-motion` stops every animation and smooth scroll.
* The confirmation moves focus to the heading and announces itself.

**Automated audit:** axe-core (WCAG 2.0/2.1/2.2 A + AA + best practice)
reports **0 violations** on the home page, all three booking steps, the error
state, and the placeholder pages.

Automated tools catch roughly a third of accessibility problems. Before launch,
also test with a real screen reader (VoiceOver on macOS/iOS, NVDA on Windows)
and by unplugging your mouse.

---

## Handing this over

If you are a student who built this and are passing it to someone else — or to
the museum — read [`docs/HANDOFF.md`](docs/HANDOFF.md) first.

The short version: **the finished site never runs on anyone's personal
computer.** `npm run dev` is for development only; production runs on Vercel,
Supabase and Resend. The thing that actually needs care during a handover is
*account ownership* — those three services must be registered to a museum or
University address rather than a personal one, because the database holds
visitors' names, phone numbers and email addresses.

## Things left for the next developer

* **Photographs.** `public/images/` holds generated placeholders — see the
  README in that folder. Alt text lives in the dictionary, not next to the
  image.
* **The remaining pages.** About, Visit, Collection, Events and Materials are
  real routes with a "coming soon" body, so no link in the design is dead.
  Replace the `<ComingSoon>` body when the designs arrive.
* **A staff view** of the bookings, if the museum wants one. Add an RLS policy
  rather than loosening the current lock-down.
* **Webfonts.** `globals.css` currently points `--font-serif` and
  `--font-sans` at system fonts, so no network request is needed. To use
  EB Garamond or Noto Serif TC (which also covers Traditional Chinese), load it
  with `next/font` in `layout.tsx` and point the variable at its `.variable`
  class. Nothing else changes.
