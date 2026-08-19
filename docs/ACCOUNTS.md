# Project accounts register

**Keep this file up to date. Never put a password or an API key in it.**

This records *which service is registered to which address*, so that whoever
inherits the project can find everything without guessing. Passwords live in a
password manager or with the supervisor — not in a git repository, which is
copied to every laptop that ever clones it.

---

## The account of record

Everything for this project is registered to a single working address:

> **`syumuseum.project@gmail.com`**

This is a placeholder, deliberately. It is not an official University mailbox
and does not pretend to be one — the `.project` in the name says so. It exists
so the project's services belong to the project rather than to a student, until
the museum has an official address to move them to.

Handover is then one password, not an archaeology project.

**Recovery:** 2FA should be on, with the backup codes held by the supervisor or
in the department's password manager. Recovery phone and backup email must not
point at a student's personal contacts — that quietly makes it a personal
account again.

---

## What is registered where

Fill in the right-hand columns as each service is set up.

| Service | What it holds | Registered to | Set up on | Notes |
| --- | --- | --- | --- | --- |
| GitHub | the source code | *(personal account — needs transferring)* | — | See HANDOFF.md step 1 |
| Vercel | the running website | `syumuseum.project@gmail.com` | *(not yet)* | Root Directory must be `syu-museum` |
| Supabase | **bookings: names, phones, emails** | `syumuseum.project@gmail.com` | *(not yet)* | The one that must end up museum-owned |
| Resend | confirmation emails | `syumuseum.project@gmail.com` | *(not yet)* | Sandbox sender only delivers to the account's own address |
| Domain name | the public web address | *(University IT)* | *(not yet)* | Needed before Resend can send to real visitors |

---

## Addresses shown to visitors

Separate from the accounts above. These appear on the website itself, so they
need a human reading them — not just a working inbox.

| Where | Set in | Currently | Status |
| --- | --- | --- | --- |
| "contact us at …" in the confirmation email | `src/config/site.ts` → `SITE.contactEmail` | `museum@hksyu.edu` | ⚠️ **Unverified guess.** Confirm or replace before launch. |
| The "From" address on confirmation emails | `.env.local` → `EMAIL_FROM` | Resend sandbox sender | Needs a verified domain before real visitors receive email |

A visitor trying to cancel a booking writes to `SITE.contactEmail`. If nobody
reads it, the booking cannot be cancelled and the place is held for a visitor
who is not coming.

---

## When the official accounts arrive

None of the above is permanent. Vercel, Supabase and Resend all let you change
the account email, or invite the official account as an owner and remove the
placeholder. That is a settings change, not a migration — which is the whole
reason for funnelling everything through one placeholder now instead of
scattering signups across personal addresses.

Work through the checklist in [`HANDOFF.md`](HANDOFF.md) when that day comes,
and update this table as you go.
