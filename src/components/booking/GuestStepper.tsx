"use client";

import { BOOKING_RULES } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/format";

/**
 * ===========================================================================
 * GUEST STEPPER —  [ − ] 2 [ + ]
 * ===========================================================================
 * The design shows a minus, a number and a plus. The tempting way to build
 * this is two buttons around a piece of text — but then there is nothing a
 * keyboard user can type into and nothing a screen reader can call a field.
 *
 * So this uses a real `<input type="number">` as the value, with the two
 * buttons as a convenience on top. That gives you, for free:
 *   • typing a number directly (much faster for a group of 14);
 *   • ↑ / ↓ arrow keys, which browsers wire up to number inputs;
 *   • the browser's own "must be between 1 and 20" behaviour; and
 *   • a proper accessible name from the <label> in the parent <Field>.
 *
 * A polite live region announces the new total after every change, so a
 * screen-reader user pressing "+" hears "3 guests selected" instead of silence.
 * ===========================================================================
 */
export function GuestStepper({
  value,
  onChange,
  dict,
  inputProps,
}: {
  value: number;
  onChange: (value: number) => void;
  dict: Dictionary;
  /** Spread from <Field> — carries the id and the aria-* wiring. */
  inputProps: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
    "aria-required": boolean | undefined;
  };
}) {
  const { minGuests, maxGuests } = BOOKING_RULES;

  /** Always keep the value inside the allowed range. */
  function setClamped(next: number) {
    if (Number.isNaN(next)) return;
    onChange(Math.min(maxGuests, Math.max(minGuests, Math.round(next))));
  }

  const announcement =
    value === 1
      ? dict.booking.stepper.announceOne
      : interpolate(dict.booking.stepper.announce, { count: value });

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="inline-flex items-center gap-1 rounded-pill border border-line bg-white/85 p-1 shadow-card">
        <button
          type="button"
          onClick={() => setClamped(value - 1)}
          disabled={value <= minGuests}
          aria-label={dict.booking.stepper.decrease}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink transition-colors hover:bg-surface-parchment disabled:opacity-40"
        >
          <span aria-hidden="true">−</span>
        </button>

        <input
          {...inputProps}
          type="number"
          inputMode="numeric"
          min={minGuests}
          max={maxGuests}
          step={1}
          value={value}
          onChange={(event) => setClamped(Number(event.target.value))}
          /* `appearance-none` hides the browser's tiny spin arrows — the two
             big buttons replace them and are far easier to hit. */
          className="w-14 [appearance:textfield] bg-transparent text-center font-serif text-base text-ink outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => setClamped(value + 1)}
          disabled={value >= maxGuests}
          aria-label={dict.booking.stepper.increase}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink transition-colors hover:bg-surface-parchment disabled:opacity-40"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      {/* Visually hidden, but read out whenever the number changes. */}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
