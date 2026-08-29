# Continue here — live SYU History Museum site

**Read this first.** The Next.js app in the repo root is the original prototype
(Vercel / Supabase / Resend). **The live site is PHP** on the University server.

Live: https://museum.hksyu.edu/  
Staff: https://museum.hksyu.edu/staff/  
Git: `Tidalwild/museum-website` branch `main`  
PHP tree: [`php-site/`](../php-site/)  
Last commit of this handoff: see `git log -1`

---

## What is live

Apache + PHP + MySQL (`museumdb.museum_bookings`). Email via PHP `mail()` from
`museum@hksyu.edu`. Staff page is a **password form** (not Google / X).

| Rule | Value |
| --- | --- |
| Hours | Tue–Sun 10:00–18:00; Monday closed |
| Session | 1.5 hours |
| Slots | 10:00, 11:30, 13:00, 14:30, **16:30** (last start so the visit ends 18:00) |
| Capacity | 30 per session |
| Same-day | Allowed; past slots for today are hidden |
| Extra guests | Booker fills first+last name for each extra person; one confirmation email |
| Collection card | Links to https://archives.hksyu.edu/ (new tab) |

Do **not** commit `php-site/inc/config.php`. Sample only: `inc/config.sample.php`.

---

## File map (PHP)

| Path | Role |
| --- | --- |
| `php-site/inc/bootstrap.php` | slots, capacity, same-day filter |
| `php-site/inc/email.php` | confirmation HTML (stacked ticket rows) |
| `php-site/inc/layout.php` | header/footer, CSS cache `?v=` |
| `php-site/assets/book.js` | booking form |
| `php-site/assets/museum.css` | site + mobile + staff |
| `php-site/api/book.php` | insert + email |
| `php-site/staff/index.php` | calendar, fill, visitors, cancel |

SFTP upload is the deploy path (Sunfish). Overwrite those files; do not drop
the zip folder as a nested directory. Bump `museum.css?v=` / `book.js?v=` in
`layout.php` / `book.php` / `staff/index.php` when CSS/JS change.

---

## Last work (2026-08-29)

1. Mobile layout: hero 4:3 on phones, header wrap, 16px inputs (no iOS zoom),
   phone row no overflow, staff calendar compact, slots 1-col, review stacked.
2. Confirmation email: **label above value**. Chinese guests label is
   **參觀人數** (not 人數). Samsung Mail was showing **!人數** because of a
   squeezed two-column table + dark mode. Old emails in inboxes will not change;
   only new bookings pick this up after `inc/email.php` is on the server.
3. Zip for that upload: `email-ticket.zip` (includes `inc/email.php`).

If the live Chinese ticket still shows `!人數`, `inc/email.php` has not been
uploaded yet.

---

## Do next (if asked)

- Confirm a **new** test booking email on a phone (中 + Eng).
- If staff/calendar/booking JS looks stale, hard-refresh or bump `?v=`.
- Privacy / retention policy for `museum_bookings` is still undecided
  (see `docs/HANDOFF.md` §6 — policy, not code).
- Keep GitHub `php-site/` in sync when the live PHP files change.

---

## New-chat starter

> Museum site. Live is PHP at museum.hksyu.edu. Code is Tidalwild/museum-website
> `php-site/`. Read `docs/CONTINUE.md`. Do not commit config.php. Continue from
> the confirmation-email ticket (stacked rows, 參觀人數).
