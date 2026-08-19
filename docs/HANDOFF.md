# Handing this project over

Written for the student who built this, and for whoever takes it on next.

The short version: **no part of the finished website runs on anyone's personal
computer.** If it ever does, something has been set up wrong.

---

## 1. Your laptop is not the server

Running `npm run dev` starts a *development* server. It exists so you can look
at your changes while you work. It is not how the public site runs, and it was
never meant to be.

A real deployment looks like this — three services, none of them your machine:

```
   Visitor's browser
          │
          ▼
   ┌──────────────┐     the website itself: pages, the booking form,
   │  Vercel      │     the server code that validates a booking
   └──────┬───────┘
          │
     ┌────┴────┐
     ▼         ▼
┌─────────┐ ┌─────────┐
│Supabase │ │ Resend  │   the bookings database  /  confirmation emails
└─────────┘ └─────────┘
```

Your laptop's only job is to edit code and push it to GitHub. Vercel picks the
change up from there. Turn your laptop off and the website stays up.

So the answer to "does this have to run from my PC?" is **no** — and you can
delete the whole folder from your machine once it is deployed, because the code
lives in GitHub.

---

## 2. The real risk is account ownership, not the computer

Here is the thing that actually bites student projects. The site itself is
fine on someone else's servers — but if those servers are signed up for with
*your personal email*, then:

- the museum's website depends on an account they cannot access;
- password resets go to your inbox, forever;
- billing, if it ever exceeds the free tier, points at you;
- when you graduate and stop reading that inbox, nobody can fix the site; and
- most seriously, **visitors' names, phone numbers and email addresses sit in a
  database registered to a private individual.**

That last one is not just untidy. Under Hong Kong's Personal Data (Privacy)
Ordinance the *data user* — the party responsible for that personal data — should
be the University or the museum, not a student. Get this right at setup and it
never becomes a problem; get it wrong and untangling it later means migrating a
live database.

None of this is about your PC being unsafe. It is about not tying an
institution's service to a personal identity.

### Who should own what

| Service | What it holds | Should be owned by |
| --- | --- | --- |
| GitHub repository | the source code | a University / museum organisation |
| Vercel | the running website | a museum or department account |
| Supabase | **visitor names, phones, emails** | the museum — this one is not negotiable |
| Resend | the sending email address | the museum, on a `@hksyu.edu` domain |
| Domain name | the public address | University IT |

The pattern to aim for: each service is registered to a **role address** like
`museum@hksyu.edu` that the department controls, and individual people are
*invited as members*. Then a person leaving removes one member instead of
orphaning an account.

---

## 3. Before the official accounts exist

Departments move slowly, and you will often be told to "just use a placeholder
account for now". That is reasonable advice, and this is how to follow it
without creating a mess.

### Make it a real mailbox, owned by the project

Create one new free mailbox that exists only for this project — something like
`syumuseum.project@gmail.com`. Then use that single address to sign up for
Vercel, Supabase and Resend.

This is better than using your own email, because the account belongs to the
project rather than to you. It is the same role-account pattern described
above, just not on a University domain yet.

Three rules make it work:

- **It must be a real inbox you can open.** Not a disposable or ten-minute
  address. Every one of these services sends verification links and password
  resets there; lose access to the mailbox and you lose the accounts, with the
  database inside them.
- **Do not set the recovery phone or backup email to your personal ones.** That
  quietly makes it your account again. Use the supervisor's, or a second
  project address.
- **Write the credentials down where the department can reach them** — the
  supervisor, a shared password manager, whatever they use. An account nobody
  else can open is not a handover, however project-branded the address looks.
- **Turn 2FA on, and store the backup codes with the credentials.** If one
  account holds the whole project, losing it loses the project — including the
  bookings database. But 2FA tied to a student's phone re-personalises the
  account, so the backup codes are what keep it recoverable after they leave.

Record which service ended up registered where in
[`ACCOUNTS.md`](ACCOUNTS.md) — passwords excluded.

### What "fake" must not mean

Two versions of this genuinely cause problems:

- **A disposable inbox.** See above — you will lose the accounts.
- **An address that implies it is official when it is not.** Registering
  something designed to look like a real University mailbox, or presenting a
  placeholder account as the museum's official contact, misleads both the
  services and anyone who writes to it. A neutral project name is fine; a
  convincing impersonation of an institutional address is not.

### Changing over later

None of this is permanent. Vercel, Supabase and Resend all let you change the
account email address, or invite the official account as an owner and remove
the placeholder. Doing that later is a settings change, not a migration — which
is exactly why using one placeholder account now is safe, and why scattering
signups across personal addresses is not.

### The address the site shows visitors

Separately from the accounts: `contactEmail` in `src/config/site.ts` is printed
in the confirmation email every visitor receives, and on the screen shown if
that email fails to send. It currently holds a **guess** (`museum@hksyu.edu`),
flagged with a comment in the file.

A placeholder there is fine while nobody is really booking. Before the site
takes real bookings it must be a mailbox someone reads — otherwise a visitor
trying to cancel writes into the void. This is a one-line change.

---

## 4. The handover checklist

Work down this list. Steps 1–3 matter even if the rest waits.

**1. Move the repository off your personal account.**
GitHub → repository **Settings** → **General** → **Transfer ownership**.
Transfer it to the University organisation, or to whoever will maintain it.
You can stay on as a collaborator afterwards.

**2. Make sure nothing depends on an account only you can reach.**
Ask yourself for each service in the table above: *if I lost my password
tomorrow, could the museum still run this site?* If the answer is no, that
service needs re-registering under a role address before you hand over.

**3. Never share a secret by sending it.**
If you have already created a Supabase or Resend key, do not paste it into
Teams, WhatsApp or email. Have the new owner generate their own keys in their
own project, and delete yours. Keys that have been messaged around should be
treated as compromised and rotated.

**4. Set up the production services under museum ownership.**
Follow `README.md` — Supabase setup and Email setup — but sign up with the role
address rather than a personal one.

**5. Deploy from the transferred repository.**
Vercel → New Project → import the repo → set **Root Directory** to
`syu-museum` → add the environment variables → Deploy.

**6. Hand over the documents, not just the code.**
Point the next person at `README.md` (how it works and how to change it),
`docs/ACCESSIBILITY.md` (what was done for WCAG 2.2 AA and what still needs
manual testing), and this file.

**7. Remove your own access when you are genuinely done.**
Not before — but once someone else is confirmed as owner, take yourself off.
Leaving a former student as an admin on a live service is its own risk.

---

## 5. Secrets: the rules that matter

The project is already set up so this is hard to get wrong, but know why:

- **`.env.local` is git-ignored and must stay that way.** It holds the real
  keys. `.env.example` is the committed template and contains only
  placeholders — never put a real value in it.
- **`SUPABASE_SERVICE_ROLE_KEY` bypasses every database permission.** Anyone
  holding it can read every booking. It lives only on the server, and
  `src/lib/supabase/server.ts` starts with `import "server-only"` so the build
  *fails* rather than shipping it to the browser by accident.
- **Anything named `NEXT_PUBLIC_*` is visible to the whole internet.** It is
  compiled into the JavaScript the browser downloads. Never rename a secret to
  have that prefix.
- **Rotate keys when a person with access leaves.** Both Supabase and Resend
  let you issue a new key and revoke the old one from their dashboards.

---

## 6. The visitor data itself

The `bookings` table holds personal data: first name, last name, phone number,
email address, visit date, and a timestamp recording consent to the Terms and
Conditions.

What is already in place:

- **Row Level Security is on with no policies.** The public key cannot read or
  write the table at all. Only the server, holding the service role key, can
  reach it. See `supabase/migrations/0001_create_bookings.sql`.
- **Consent is recorded, not assumed.** `accepted_terms_at` stores *when* the
  visitor ticked the box.

What the museum still needs to decide — these are policy questions, not code
questions, and they should be answered before the site goes live:

- **How long are bookings kept?** Right now, forever. Personal data should not
  be. A sensible rule is to delete records some months after the visit date;
  Supabase can run that on a schedule.
- **Who may read the table, and how?** Today the answer is "only the server."
  If staff need a booking list, add a Row Level Security policy for
  authenticated staff rather than handing anyone the service role key. There is
  a commented example at the bottom of the migration.
- **Is there a privacy notice?** Visitors are told the Terms and Conditions,
  but not yet what happens to their data or how to ask for its deletion. Most
  institutions have standard wording for this — ask.

---

## 7. For whoever picks this up

Everything you need is in the repository.

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # typecheck + lint + validation self-check
```

It runs with no configuration at all — the booking flow works end to end and
prints the confirmation email to your terminal instead of sending it. Add the
Supabase keys when you want bookings to actually save.

The two files you will edit most:

- `src/config/site.ts` — opening hours, address, capacity, party-size limits,
  navigation, the referral dropdown options.
- `src/lib/i18n/dictionaries/en.ts` — every word on the site, including the
  Terms and Conditions.

Nothing user-visible is hard-coded inside a component, so most content changes
touch one of those two files and nothing else.

Before changing the UI, read `docs/ACCESSIBILITY.md`. The site targets
WCAG 2.2 Level AA and currently passes an automated audit with zero violations;
it is much easier to keep that than to win it back.
