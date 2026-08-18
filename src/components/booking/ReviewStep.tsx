"use client";

import { PHONE_COUNTRY_CODES, REFERRAL_SOURCES } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { formatLongDate } from "@/lib/booking/dates";
import { resolveErrorMessage } from "@/lib/booking/messages";
import type { BookingErrors, BookingFieldName, BookingFormValues } from "@/lib/booking/schema";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/format";
import { BookingCard, SectionHeading } from "./BookingCard";
import { TermsAndConditions } from "./TermsAndConditions";

/**
 * ===========================================================================
 * STEP 2 — review your answers, read the terms, submit
 * ===========================================================================
 * Recreates the second mock-up: a read-only "Guest Information" grid, the full
 * Terms and Conditions, a consent tick box, and the brown "Submit" pill.
 *
 * The design shows the answers as plain text. This version adds a small "Edit"
 * link beside each one. That is WCAG 3.3.4 (Error Prevention) — for anything
 * that creates a commitment, the visitor must be able to review AND correct
 * their answers before it is final. Going "Back" and hunting for the field
 * technically satisfies it; a direct link is far kinder.
 * ===========================================================================
 */
export function ReviewStep({
  values,
  errors,
  messageValues,
  onAcceptedTermsChange,
  onEditField,
  onSubmit,
  isSubmitting,
  dict,
  locale,
}: {
  values: BookingFormValues;
  errors: BookingErrors;
  messageValues: Record<string, string | number>;
  onAcceptedTermsChange: (accepted: boolean) => void;
  /** Jump back to step 1 with focus already on the field being fixed. */
  onEditField: (field: BookingFieldName) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  dict: Dictionary;
  locale: Locale;
}) {
  const r = dict.booking.review;

  /** Look the human-readable referral label back up from its stored value. */
  const referralLabel = (() => {
    const source = REFERRAL_SOURCES.find((item) => item.value === values.referralSource);
    return source ? dict.booking.referralOptions[source.labelKey] : "—";
  })();

  const phoneCode =
    PHONE_COUNTRY_CODES.find((c) => c.code === values.phoneCountryCode)?.code ??
    values.phoneCountryCode;

  /** The six read-only answers, in the order the design lays them out. */
  const summary: Array<{ field: BookingFieldName; label: string; value: string }> = [
    {
      field: "firstName",
      label: r.name,
      value: `${values.firstName} ${values.lastName}`.trim(),
    },
    { field: "phone", label: r.phone, value: `${phoneCode} ${values.phone}` },
    { field: "email", label: r.email, value: values.email },
    { field: "guests", label: r.guests, value: String(values.guests) },
    {
      field: "visitDate",
      label: r.date,
      value: values.visitDate ? formatLongDate(values.visitDate, locale) : "—",
    },
    { field: "referralSource", label: r.referral, value: referralLabel },
  ];

  const termsError = resolveErrorMessage(errors.acceptedTerms, dict, messageValues);
  const guestsError = resolveErrorMessage(errors.guests, dict, messageValues);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <BookingCard>
        <SectionHeading id="guest-information-heading">
          {dict.booking.guestInformation}
        </SectionHeading>

        {/* A description list is the right element for label/value pairs:
            screen readers announce "Email Address, johndoe@gmail.com" as a
            pair rather than as six loose lines of text.

            The vertical rules from the design are `border-l` on the grid
            columns and are purely decorative. */}
        <dl className="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-3">
          {summary.map((item, index) => (
            <div
              key={item.field}
              className={index % 3 !== 0 ? "sm:border-l sm:border-line-soft sm:pl-8" : undefined}
            >
              <dt className="font-serif text-[15px] font-medium text-ink">{item.label}:</dt>
              <dd className="mt-1 flex flex-wrap items-baseline gap-x-3">
                {/* brand-brown-soft is a deliberately muted brown that still
                    clears 4.5:1 against the card — the design's lighter grey
                    would have failed. */}
                <span className="font-serif text-[15px] text-brand-brown-soft">
                  {item.value || "—"}
                </span>
                <button
                  type="button"
                  onClick={() => onEditField(item.field)}
                  aria-label={interpolate(r.editField, { field: item.label })}
                  className="font-sans text-xs text-brand-brown underline underline-offset-4 hover:no-underline"
                >
                  {r.edit}
                </button>
              </dd>
            </div>
          ))}
        </dl>

        {/* If the server rejected the booking because the day filled up, the
            message belongs here, next to the guest count. */}
        {guestsError && (
          <p
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-md border-2 border-danger bg-white/60 p-3 font-sans text-sm font-medium text-danger"
          >
            <span aria-hidden="true">⚠</span>
            <span>{guestsError}</span>
          </p>
        )}

        <TermsAndConditions dict={dict} />
      </BookingCard>

      {/* ------------------------- Consent + Submit -------------------------- */}
      <div className="mt-8">
        <div className="flex items-start justify-center gap-3">
          <input
            id="booking-acceptedTerms"
            type="checkbox"
            checked={values.acceptedTerms}
            onChange={(event) => onAcceptedTermsChange(event.target.checked)}
            aria-required="true"
            aria-invalid={errors.acceptedTerms ? true : undefined}
            aria-describedby={termsError ? "booking-acceptedTerms-error" : undefined}
            /* h-5 w-5 keeps the hit area comfortable; `accent-*` colours the
               native tick instead of replacing the control with a <div>,
               which would lose all its built-in keyboard behaviour. */
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand-brown"
          />
          <label
            htmlFor="booking-acceptedTerms"
            className="max-w-2xl cursor-pointer font-serif text-[13px] leading-relaxed text-ink"
          >
            <span aria-hidden="true" className="mr-1 text-danger">
              ✱
            </span>
            <span className="sr-only">({dict.booking.requiredFieldSuffix}) </span>
            {dict.booking.termsConsent}
          </label>
        </div>

        {termsError && (
          <p
            id="booking-acceptedTerms-error"
            role="alert"
            className="mt-2 flex items-center justify-center gap-1.5 font-sans text-sm font-medium text-danger"
          >
            <span aria-hidden="true">⚠</span>
            <span>{termsError}</span>
          </p>
        )}

        <div className="mt-7 flex justify-center">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? dict.booking.submitting : dict.booking.submit}
          </Button>
        </div>

        {/* While the request is in flight, tell screen-reader users something
            is happening — a spinner they cannot see is no feedback at all. */}
        <p aria-live="polite" className="sr-only">
          {isSubmitting ? dict.booking.submitting : ""}
        </p>
      </div>
    </form>
  );
}
