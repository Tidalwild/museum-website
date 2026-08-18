"use client";

import { PHONE_COUNTRY_CODES, REFERRAL_SOURCES } from "@/config/site";
import { Field, INPUT_BASE_CLASSES, INPUT_CLASSES } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { resolveErrorMessage } from "@/lib/booking/messages";
import type { BookingErrors, BookingFormValues } from "@/lib/booking/schema";
import { BookingCard, SectionHeading } from "./BookingCard";
import { DatePicker } from "./DatePicker";
import { fieldAnchorId } from "./ErrorSummary";
import { GuestStepper } from "./GuestStepper";

/**
 * ===========================================================================
 * STEP 1 — "Guest Information"
 * ===========================================================================
 * Recreates the first booking mock-up:
 *
 *   [ ✱ First Name ] [ ✱ Last Name ] [ Phone Number (+852 | 1234 5678) ]
 *   [ ✱ Email Address, with the red warning line above it              ]
 *   [ ✱ Pick Date of Visitation ]      [ ✱ Number of Guest(s)  − 2 +   ]
 *   [        calendar            ]      [ How You Heard About Us  ▾    ]
 *                          ( Next )
 *
 * Notes on choices that differ from the picture:
 *  • "How You Heard About Us" is drawn as a custom drop-down with the options
 *    already open. This uses a NATIVE <select> instead. It looks almost
 *    identical, and it gives you the operating system's own picker — which is
 *    already keyboard-accessible, works with every screen reader, and on a
 *    phone opens the big native wheel. A hand-rolled listbox would need
 *    several hundred lines of ARIA to match that, and would still be worse.
 *  • The design marks it optional (no red ✱), but the museum asked for the
 *    answer, so it is required here. To make it optional again: drop
 *    `required` below and change `referralSource` in `schema.ts` to
 *    `.optional()`.
 * ===========================================================================
 */
export function GuestDetailsStep({
  values,
  errors,
  messageValues,
  onChange,
  onNext,
  dict,
  locale,
}: {
  values: BookingFormValues;
  errors: BookingErrors;
  messageValues: Record<string, string | number>;
  /** Update a single field: onChange("email", "a@b.com") */
  onChange: <K extends keyof BookingFormValues>(field: K, value: BookingFormValues[K]) => void;
  onNext: () => void;
  dict: Dictionary;
  locale: Locale;
}) {
  const f = dict.booking.fields;
  const error = (key: keyof BookingErrors) =>
    resolveErrorMessage(errors[key], dict, messageValues);

  return (
    /* One <form> so the browser treats these inputs as a set: Enter submits,
       and the browser's own autofill behaves properly. The form WRAPS the card
       because the design places the "Next" button outside and below it. */
    <form
      noValidate /* we show our own, friendlier messages */
      onSubmit={(event) => {
        event.preventDefault();
        onNext();
      }}
    >
      <BookingCard>
        <SectionHeading
          id="guest-information-heading"
          trailing={
            /* The red "✱ must fill" legend from the design. It explains what
               the asterisks mean — without it, the ✱ is just a symbol. */
            <p className="font-sans text-xs text-danger">
              <span aria-hidden="true">✱ </span>
              {dict.booking.requiredLegend}
            </p>
          }
        >
          {dict.booking.guestInformation}
        </SectionHeading>

        <div className="mt-7">
          {/* ------------------------ Names and phone ------------------------ */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Field
              id={fieldAnchorId("firstName")}
              label={f.firstName}
              required
              requiredSuffix={dict.booking.requiredFieldSuffix}
              error={error("firstName")}
            >
              {({ inputProps }) => (
                <input
                  {...inputProps}
                  type="text"
                  name="given-name"
                  /* `autoComplete` lets the browser fill this in — WCAG 1.3.5
                     Identify Input Purpose, and simply much less typing. */
                  autoComplete="given-name"
                  maxLength={60}
                  value={values.firstName}
                  onChange={(event) => onChange("firstName", event.target.value)}
                  className={INPUT_CLASSES}
                />
              )}
            </Field>

            <Field
              id={fieldAnchorId("lastName")}
              label={f.lastName}
              required
              requiredSuffix={dict.booking.requiredFieldSuffix}
              error={error("lastName")}
            >
              {({ inputProps }) => (
                <input
                  {...inputProps}
                  type="text"
                  name="family-name"
                  autoComplete="family-name"
                  maxLength={60}
                  value={values.lastName}
                  onChange={(event) => onChange("lastName", event.target.value)}
                  className={INPUT_CLASSES}
                />
              )}
            </Field>

            {/* Phone is TWO controls (code + number) but ONE idea, so they sit
                in a <fieldset> with a <legend>. A screen reader then reads
                "Phone Number, Country code, combo box" — the grouping is not
                left to visual proximity alone. */}
            <fieldset className="min-w-0">
              <legend className="block font-serif text-[15px] text-ink">
                <span aria-hidden="true" className="mr-1 text-danger">
                  ✱
                </span>
                <span className="sr-only">({dict.booking.requiredFieldSuffix}) </span>
                {f.phone}:
              </legend>

              <div className="mt-1.5 flex gap-2">
                <label htmlFor={fieldAnchorId("phoneCountryCode")} className="sr-only">
                  {f.phoneCountryCode}
                </label>
                <select
                  id={fieldAnchorId("phoneCountryCode")}
                  autoComplete="tel-country-code"
                  value={values.phoneCountryCode}
                  onChange={(event) => onChange("phoneCountryCode", event.target.value)}
                  /* INPUT_BASE_CLASSES, not INPUT_CLASSES: this one needs a
                     fixed width, and `w-full` would fight it. */
                  /* INPUT_BASE_CLASSES, not INPUT_CLASSES: this one needs a
                     fixed width, and `w-full` would fight it. The width is
                     tuned so the longest option fits without being clipped
                     when the select is closed. */
                  className={`${INPUT_BASE_CLASSES} w-[9.5rem] shrink-0 px-2 text-sm`}
                >
                  {PHONE_COUNTRY_CODES.map((country) => (
                    /* The closed select shows only the dialling code (there
                       is no room for more), but each OPTION spells out the
                       country so the list is understandable on its own. */
                    <option key={country.code} value={country.code}>
                      {country.code} · {dict.booking.countries[country.labelKey]}
                    </option>
                  ))}
                </select>

                <div className="min-w-0 flex-1">
                  <label htmlFor={fieldAnchorId("phone")} className="sr-only">
                    {f.phone}
                  </label>
                  <input
                    id={fieldAnchorId("phone")}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    aria-required="true"
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={errors.phone ? `${fieldAnchorId("phone")}-error` : undefined}
                    placeholder="1234 5678"
                    value={values.phone}
                    onChange={(event) => onChange("phone", event.target.value)}
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              {error("phone") && (
                <p
                  id={`${fieldAnchorId("phone")}-error`}
                  role="alert"
                  className="mt-1.5 flex items-start gap-1.5 font-sans text-sm font-medium text-danger"
                >
                  <span aria-hidden="true">⚠</span>
                  <span>{error("phone")}</span>
                </p>
              )}
            </fieldset>
          </div>

          {/* ---------------------------- Email ----------------------------- */}
          <div className="mt-8">
            <Field
              id={fieldAnchorId("email")}
              label={f.email}
              required
              requiredSuffix={dict.booking.requiredFieldSuffix}
              /* The red italic warning from the design. It sits in `help`, so
                 it is linked by aria-describedby and read out with the field
                 rather than being a floating sentence. */
              help={
                <>
                  <span aria-hidden="true">✱ </span>
                  {f.emailHelp}
                </>
              }
              error={error("email")}
            >
              {({ inputProps }) => (
                <input
                  {...inputProps}
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="name@example.com"
                  value={values.email}
                  onChange={(event) => onChange("email", event.target.value)}
                  className={INPUT_CLASSES}
                />
              )}
            </Field>
          </div>

          {/* ------------------- Date, guests and referral ------------------- */}
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {/* Left: the calendar */}
            <Field
              id={fieldAnchorId("visitDate")}
              label={f.date}
              required
              requiredSuffix={dict.booking.requiredFieldSuffix}
              error={error("visitDate")}
            >
              {({ inputProps }) => (
                <DatePicker
                  id={inputProps.id}
                  value={values.visitDate}
                  onChange={(next) => onChange("visitDate", next)}
                  describedBy={inputProps["aria-describedby"]}
                  invalid={inputProps["aria-invalid"]}
                  dict={dict}
                  locale={locale}
                />
              )}
            </Field>

            {/* Right: guest count, then referral source */}
            <div className="space-y-8">
              <Field
                id={fieldAnchorId("guests")}
                label={f.guests}
                required
                requiredSuffix={dict.booking.requiredFieldSuffix}
                error={error("guests")}
              >
                {({ inputProps }) => (
                  <GuestStepper
                    value={values.guests}
                    onChange={(next) => onChange("guests", next)}
                    dict={dict}
                    inputProps={inputProps}
                  />
                )}
              </Field>

              <Field
                id={fieldAnchorId("referralSource")}
                label={f.referral}
                required
                requiredSuffix={dict.booking.requiredFieldSuffix}
                error={error("referralSource")}
              >
                {({ inputProps }) => (
                  <select
                    {...inputProps}
                    value={values.referralSource}
                    onChange={(event) => onChange("referralSource", event.target.value)}
                    className={`${INPUT_CLASSES} max-w-sm`}
                  >
                    {/* An empty first option means "nothing chosen yet", which
                        is what makes the required check meaningful. */}
                    <option value="">{f.referralPlaceholder}</option>
                    {REFERRAL_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {dict.booking.referralOptions[source.labelKey]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
          </div>

        </div>
      </BookingCard>

      {/* ------------------------------- Next -------------------------------- */}
      {/* A real submit button, so pressing Enter in any input does the same
          thing as clicking it. It ACTS (validates and advances), so it is a
          <button> — not a link. */}
      <div className="mt-10 flex justify-center">
        <Button type="submit" size="lg">
          {dict.booking.next}
        </Button>
      </div>
    </form>
  );
}
