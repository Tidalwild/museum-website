"use client";

import { useEffect, useRef } from "react";

import { SITE } from "@/config/site";
import { Button, ButtonLink } from "@/components/ui/Button";
import { formatLongDateWithWeekday } from "@/lib/booking/dates";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/format";
import { BookingCard } from "./BookingCard";

/**
 * ===========================================================================
 * STEP 3 — confirmation
 * ===========================================================================
 * The designs stop at "Submit", so this screen is new. It follows the same
 * visual language and is built around one accessibility principle:
 *
 *   A sighted visitor sees the page change. A screen-reader user does not —
 *   unless you tell them.
 *
 * So on arrival this component:
 *   1. announces "Booking confirmed." through a live region, and
 *   2. moves keyboard focus to the confirmation heading.
 *
 * Together those mean the next thing anyone hears, whatever they are using,
 * is that the booking worked.
 *
 * The booking reference is rendered in a monospace font with wide letter
 * spacing so it is easy to read aloud over the phone, and it is announced
 * character by character in a `sr-only` span.
 * ===========================================================================
 */
export function SuccessStep({
  reference,
  email,
  visitDate,
  guests,
  emailSent,
  onBookAnother,
  dict,
  locale,
}: {
  reference: string;
  email: string;
  visitDate: string;
  guests: number;
  emailSent: boolean;
  onBookAnother: () => void;
  dict: Dictionary;
  locale: Locale;
}) {
  const s = dict.booking.success;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // WCAG 2.4.3 Focus Order: after a page-level change, put the keyboard
    // cursor at the start of the new content, not back at the top of the site.
    headingRef.current?.focus();
  }, []);

  return (
    <>
      {/* role="status" is announced politely as soon as it appears. */}
      <p role="status" className="sr-only">
        {s.announcement}
      </p>

      <BookingCard>
        <div className="text-center">
          {/* The tick is decorative — the heading below carries the message,
              so success is never signalled by a green circle alone. */}
          <span
            aria-hidden="true"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-2xl text-white"
          >
            ✓
          </span>

          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 font-serif text-2xl font-bold text-brand-brown sm:text-3xl"
          >
            {s.title}
          </h2>

          <p className="mx-auto mt-3 max-w-xl font-serif text-[15px] leading-relaxed text-ink">
            {s.intro}
          </p>
        </div>

        {/* ------------------------ The admission ticket ---------------------- */}
        <div className="mx-auto mt-8 max-w-md rounded-xl border-2 border-dashed border-line bg-surface-cream p-5 text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-brand-brown">
            {s.referenceLabel}
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-[0.18em] text-brand-green sm:text-3xl">
            {/* Shown once for the eye… */}
            <span aria-hidden="true">{reference}</span>
            {/* …and once spelled out, so a screen reader reads
                "S Y U M dash 7 K 2 Q D 4" instead of an unpronounceable word. */}
            <span className="sr-only">{reference.split("").join(" ")}</span>
          </p>

          <dl className="mt-5 space-y-2 border-t border-line-soft pt-4 text-left font-serif text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-brand-brown">{dict.booking.review.date}:</dt>
              <dd className="text-right font-medium text-ink">
                {formatLongDateWithWeekday(visitDate, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-brown">{dict.booking.review.guests}:</dt>
              <dd className="text-right font-medium text-ink">{guests}</dd>
            </div>
          </dl>
        </div>

        {/* --------------------------- Email status --------------------------- */}
        {emailSent ? (
          <p className="mx-auto mt-6 max-w-xl text-center font-serif text-sm text-ink">
            {s.emailSentTo} <strong className="font-semibold">{email}</strong>.{" "}
            <span className="text-brand-brown-soft">{s.emailDelayNote}</span>
          </p>
        ) : (
          /* The booking IS saved — this is a warning, not a failure. Saying
             "error" here would send people back to book a second time. */
          <p
            role="alert"
            className="mx-auto mt-6 flex max-w-xl items-start gap-2 rounded-md border-2 border-danger bg-white/60 p-3 font-sans text-sm text-danger"
          >
            <span aria-hidden="true">⚠</span>
            <span>{interpolate(s.emailFailed, { email: SITE.contactEmail })}</span>
          </p>
        )}

        {/* --------------------------- Before you visit ----------------------- */}
        <section aria-labelledby="what-next-heading" className="mx-auto mt-8 max-w-xl">
          <h3 id="what-next-heading" className="font-serif text-lg font-semibold text-brand-brown">
            {s.whatNextTitle}
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 font-serif text-sm leading-relaxed text-ink">
            {s.whatNext.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </BookingCard>

      {/* ------------------------------- Actions ------------------------------ */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {/* ACTION — resets the form in place, so it is a <button>. */}
        <Button onClick={onBookAnother} variant="outline">
          {s.bookAnother}
        </Button>
        {/* NAVIGATION — goes to another page, so it is a link. */}
        <ButtonLink href="/" variant="ghost">
          {s.backHome}
        </ButtonLink>
      </div>
    </>
  );
}
