# Accessibility — WCAG 2.2 Level AA

What was built, where it lives, and how it was checked.

**Automated audit result:** axe-core, running the `wcag2a`, `wcag2aa`,
`wcag21a`, `wcag21aa`, `wcag22aa` and `best-practice` rule sets, reports
**0 violations** on:

* the home page
* booking step 1 (empty)
* booking step 1 (with validation errors showing)
* booking step 2 (review + terms)
* booking step 3 (confirmation)
* the placeholder pages

Automated tools catch roughly a third of real accessibility problems. The
manual checks below matter more.

---

## 1. Perceivable

| Criterion | What was done | Where |
| --- | --- | --- |
| **1.1.1** Non-text Content | Meaningful images have descriptive `alt`; the hero photo's description is a full sentence. Decorative glyphs (`→`, `▶`, `⚠`, `✓`, the divider rules) are `aria-hidden`. Card images use `alt=""` because the caption inside the same link already names them. | `home/Hero.tsx`, `home/ExploreCards.tsx`, `ui/Button.tsx` |
| **1.3.1** Info and Relationships | Real `<header>` / `<nav>` / `<main>` / `<footer>` / `<aside>`; `<dl>` for the review summary; `<ul>` for lists; `<fieldset>`+`<legend>` for the two-part phone field; `<address>` for the address. | throughout |
| **1.3.5** Identify Input Purpose | `autoComplete` on every personal-detail field (`given-name`, `family-name`, `tel-national`, `tel-country-code`, `email`). | `booking/GuestDetailsStep.tsx` |
| **1.4.1** Use of Colour | Nothing is signalled by colour alone. Errors get ⚠ + text. The active nav item gets `aria-current` + an underline. The chosen date gets ✓ + bold + `aria-selected` on the cell. Unavailable dates get a strikethrough. Success gets a heading, not just a green circle. | `ui/Field.tsx`, `booking/DatePicker.tsx`, `layout/SiteHeader.tsx` |
| **1.4.3** Contrast (Minimum) | Every colour pair in `tailwind.config.ts` was measured; the ratio is written in a comment beside each token. Lowest text pair in use is **5.1:1** (the muted brown on the review card) against a 4.5:1 requirement. The design's lighter placeholder grey would have failed, so it was darkened. | `tailwind.config.ts` |
| **1.4.4** Resize Text | No `maximum-scale` or `user-scalable=no`. Layout is relative units and flex/grid throughout. | `app/layout.tsx` |
| **1.4.10** Reflow | No horizontal scrolling at 320 px — verified at 390 px, 860 px and 1280 px. | verified |
| **1.4.11** Non-text Contrast | Form controls have a real `border` (not just a background tint), so their boundary clears 3:1. | `ui/Field.tsx` → `INPUT_BASE_CLASSES` |
| **1.4.12** Text Spacing | No fixed heights on text containers; line-height 1.6–2 on body copy. | throughout |

---

## 2. Operable

| Criterion | What was done | Where |
| --- | --- | --- |
| **2.1.1** Keyboard | Everything is reachable and operable by keyboard. Actions are `<button>`, navigation is `<a>` — see the note below. The calendar is a full ARIA date grid. | throughout |
| **2.1.2** No Keyboard Trap | The calendar uses a **roving tabindex**: exactly one day is in the tab order, so Tab enters and leaves the grid in one press instead of trapping you for 31. Verified: `[role="grid"] button[tabindex="0"]` count is always 1. | `booking/DatePicker.tsx` |
| **2.4.1** Bypass Blocks | A skip link is the first focusable element on every page. Verified: the first Tab press lands on "Skip to main content". | `layout/SkipLink.tsx` |
| **2.4.2** Page Titled | Each route sets its own `<title>` through `generateMetadata`, translated. | `app/*/page.tsx` |
| **2.4.3** Focus Order | After a failed submit, focus moves to the error summary. After a successful booking, focus moves to the confirmation heading. After an "Edit" link, focus lands on the field being fixed. | `booking/ErrorSummary.tsx`, `booking/SuccessStep.tsx`, `booking/BookingFlow.tsx` |
| **2.4.4** Link Purpose | Ambiguous links get a fuller `aria-label` ("Register — book your museum visit"). External links announce "opens in a new tab". | `layout/AnnouncementBar.tsx`, `layout/SiteFooter.tsx` |
| **2.4.6** Headings and Labels | Headings never skip a level — `SectionHeading` takes an `as` prop so a level is never chosen for its font size. Every control has a visible label. | `booking/BookingCard.tsx` |
| **2.4.7** Focus Visible | One global 3 px `:focus-visible` outline with a 3 px offset. Dark backgrounds carry `.on-dark`, which switches the ring to a light colour so it stays visible. | `app/globals.css` |
| **2.4.11** Focus Not Obscured | Nothing is sticky or overlaid, so a focused element can never be hidden behind a fixed bar. | — |
| **2.5.3** Label in Name | Visible label text is always contained in the accessible name. | throughout |
| **2.5.8** Target Size (Minimum) | Buttons are `min-h-[44px]`; calendar days and stepper buttons are 36 px, comfortably over the 24 px minimum. | `ui/Button.tsx` |
| **2.3.3** Animation from Interactions | `prefers-reduced-motion: reduce` disables every animation, transition and smooth scroll. The announcement-bar arrows are `motion-safe:` only, and the JavaScript scroll helpers check `matchMedia` before animating. | `app/globals.css`, `booking/BookingFlow.tsx` |

### Buttons versus links — the rule used throughout

The designs contain elements that look identical but behave differently. Each
one was implemented as the correct element:

| Element in the design | Behaviour | Rendered as |
| --- | --- | --- |
| Wordmark, Home / About / Visit | navigates | `<a>` (Next `<Link>`) |
| "Register" pill | navigates to `/book` | `<a>` |
| "Learn More ▶" pill | navigates to `/about` | `<a>` |
| Collection / Events / Materials cards | navigate | one `<a>` per card, wrapping image and caption |
| "View on Google Maps" | navigates, new tab | `<a target="_blank">` |
| "Return to the top ↑" | in-page anchor | `<a href="#top">` |
| 中 / Eng | changes a setting | `<button>` |
| ← back arrow, **step 1** | leaves for "Plan your visit" | `<a>` |
| ← back arrow, **step 2** | goes back within the page | `<button>` |
| "Next" | validates and advances | `<button type="submit">` |
| "Submit" | submits the booking | `<button type="submit">` |
| "Make another booking" | resets the form in place | `<button>` |

Getting this wrong is one of the most common accessibility failures on the web:
a `<div onClick>` is not focusable, a `<button>` that navigates breaks
middle-click and "open in new tab", and a link that acts is announced with the
wrong role.

---

## 3. Understandable

| Criterion | What was done | Where |
| --- | --- | --- |
| **3.1.1** Language of Page | `<html lang>` is set from the chosen locale (`en` or `zh-Hant-HK`), so screen readers pick the right voice. | `app/layout.tsx` |
| **3.1.2** Language of Parts | The 中 button carries `lang="zh-Hant"`. | `layout/LanguageSwitcher.tsx` |
| **3.2.1 / 3.2.2** On Focus / On Input | Nothing changes context on focus or on typing. The step only advances when a button is pressed. | — |
| **3.2.5** Change on Request | External links warn "(opens in a new tab)" before they steal focus. | `layout/SiteFooter.tsx` |
| **3.3.1** Error Identification | Errors appear in **two** places: a summary box at the top of the form, and next to the field. Both use ⚠ + text. Fields get `aria-invalid` and `aria-describedby`. | `booking/ErrorSummary.tsx`, `ui/Field.tsx` |
| **3.3.2** Labels or Instructions | Every field has a visible `<label>`. Required fields get a red ✱, an sr-only "(required)", `aria-required`, and there is a "✱ must fill" legend explaining the symbol. | `ui/Field.tsx` |
| **3.3.3** Error Suggestion | Messages say what to do, not just what is wrong: "Enter an email address in the correct format, like name@example.com", "The museum is closed on that date. Choose another day." | `dictionaries/en.ts` → `booking.errors` |
| **3.3.4** Error Prevention | Step 2 is a full review before anything is committed, and every answer has an "Edit" link that jumps back with focus already on that field. | `booking/ReviewStep.tsx` |
| **3.3.7** Redundant Entry | Answers persist across step changes — going back and forward never loses what was typed. | `booking/BookingFlow.tsx` |
| **3.3.8** Accessible Authentication | No login, no CAPTCHA, no puzzle. | — |

---

## 4. Robust

| Criterion | What was done |
| --- | --- |
| **4.1.2** Name, Role, Value | Native elements wherever possible. The referral dropdown is a real `<select>`, not a hand-rolled listbox, so it inherits the operating system's own accessible picker. The guest stepper is a real `<input type="number">` with two buttons on top, so it can be typed into and driven with ↑ / ↓. |
| **4.1.3** Status Messages | Polite live regions announce: the chosen date, the guest count, the current step, "Submitting your booking…", and "Booking confirmed." Errors use `role="alert"`. None of them steal focus except the error summary, which does so deliberately. |

### The one place ARIA was needed

The calendar. It follows the ARIA Authoring Practices date-grid pattern:

* `role="grid"` / `row` / `columnheader` / `gridcell`
* roving tabindex — one tab stop for the whole month
* `aria-selected` on the **gridcell** (a `<button>` role does not support it);
  the button itself carries `aria-current="date"`
* `aria-disabled` on unavailable days, which keeps them focusable so a keyboard
  user can still hear *why* a day cannot be chosen instead of it silently
  vanishing
* each day's accessible name is a full sentence: "19 August 2026, selected" or
  "24 August 2026, closed"
* keys: ← → day, ↑ ↓ week, Home/End week edges, PageUp/PageDown month,
  Enter/Space to choose

---

## Before launch

Automated checks are the floor, not the ceiling. Still to do:

1. **Screen reader.** Walk the whole booking flow with VoiceOver (macOS/iOS)
   and NVDA (Windows). Listen for anything announced twice, or not at all.
2. **Keyboard only.** Unplug the mouse and complete a booking.
3. **Zoom.** 200% and 400% browser zoom, and 320 px width.
4. **Reduced motion.** Turn it on in your OS and confirm the page is still.
5. **Real content.** Re-check contrast once real photographs replace the
   placeholders, especially any text placed over an image.
6. **Chinese.** Re-run all of the above once the Chinese copy is in — line
   lengths and wrapping change.
