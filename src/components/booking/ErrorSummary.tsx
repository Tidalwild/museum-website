"use client";

import { useEffect, useRef } from "react";

import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/format";
import type { BookingFieldName } from "@/lib/booking/schema";

/**
 * ===========================================================================
 * ERROR SUMMARY
 * ===========================================================================
 * When a form fails validation, marking each broken input in red is not
 * enough: on a long form the visitor cannot see what went wrong without
 * hunting for it, and a screen-reader user gets no signal at all.
 *
 * The fix — the pattern used by GOV.UK and required in spirit by
 * WCAG 3.3.1 (Error Identification) and 3.3.3 (Error Suggestion) — is a
 * summary box at the top of the form that:
 *
 *   • receives keyboard FOCUS the moment it appears, so a screen reader reads
 *     it out immediately and the visitor's cursor is already at the problem;
 *   • lists every error as a LINK straight to the offending field; and
 *   • repeats the same wording shown next to the field itself.
 *
 * `tabIndex={-1}` makes the box focusable by script without adding it to the
 * normal tab order.
 * ===========================================================================
 */
export function ErrorSummary({
  items,
  dict,
  /** Bump this number every time you want the box to re-take focus. */
  focusToken,
}: {
  items: Array<{ field: BookingFieldName; label: string; message: string }>;
  dict: Dictionary;
  focusToken: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length > 0) containerRef.current?.focus();
    // `focusToken` is in the dependency list so a SECOND failed submit with
    // the same errors still pulls focus back to the summary.
  }, [items.length, focusToken]);

  if (items.length === 0) return null;

  const title =
    items.length === 1
      ? dict.booking.errors.summaryTitle
      : interpolate(dict.booking.errors.summaryTitlePlural, { count: items.length });

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      /* role="alert" + aria-live make assistive tech announce this the moment
         it is inserted, even before focus lands. */
      role="alert"
      aria-labelledby="error-summary-title"
      className="mb-6 rounded-lg border-2 border-danger bg-white/70 p-4 sm:p-5"
    >
      <h2
        id="error-summary-title"
        className="flex items-center gap-2 font-serif text-lg font-semibold text-danger"
      >
        <span aria-hidden="true">⚠</span>
        {title}
      </h2>

      <p className="mt-1 font-sans text-sm text-ink">{dict.booking.errors.summaryHint}</p>

      <ul className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={item.field}>
            {/* A plain in-page anchor. Clicking it (or pressing Enter on it)
                moves focus to the input with that id. */}
            <a
              href={`#${fieldAnchorId(item.field)}`}
              onClick={(event) => {
                event.preventDefault();
                focusField(item.field);
              }}
              className="font-sans text-sm font-medium text-danger underline underline-offset-4 hover:no-underline"
            >
              {item.label}: {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The DOM id given to each field. Kept in one place so the summary links and
 * the inputs can never disagree.
 */
export function fieldAnchorId(field: BookingFieldName): string {
  return `booking-${field}`;
}

/** Moves keyboard focus (and the viewport) to a field. */
function focusField(field: BookingFieldName) {
  const element = document.getElementById(fieldAnchorId(field));
  if (!element) return;
  element.focus({ preventScroll: true });
  // Respect "reduce motion": jump instantly rather than animating the scroll.
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({
    block: "center",
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}
