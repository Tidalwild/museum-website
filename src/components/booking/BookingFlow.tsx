"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { createBooking } from "@/lib/booking/actions";
import { IS_STATIC_DEMO } from "@/config/demo";
import { errorSummaryItems, resolveErrorMessage } from "@/lib/booking/messages";
import {
  EMPTY_BOOKING_FORM,
  STEP_ONE_FIELDS,
  validateBooking,
  type BookingErrors,
  type BookingFieldName,
  type BookingFormValues,
} from "@/lib/booking/schema";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ErrorSummary, fieldAnchorId } from "./ErrorSummary";
import { GuestDetailsStep } from "./GuestDetailsStep";
import { ReviewStep } from "./ReviewStep";
import { StepIndicator } from "./StepIndicator";
import { SuccessStep } from "./SuccessStep";

/**
 * ===========================================================================
 * BOOKING FLOW — the one stateful component of the booking page
 * ===========================================================================
 * Everything the visitor does lives here:
 *
 *   step 1  GuestDetailsStep   fill in your details          →  "Next"
 *   step 2  ReviewStep         check them, agree to terms    →  "Submit"
 *   step 3  SuccessStep        booking reference + email
 *
 * WHY IT IS ONE COMPONENT AND NOT THREE PAGES
 * The design's back arrow changes meaning between steps — on step 1 it LEAVES
 * for "Plan your visit", on step 2 it goes BACK to the details. Keeping the
 * answers in one place means step 2 → step 1 → step 2 never loses what the
 * visitor typed, which is both nicer and a WCAG 3.3.4 expectation.
 *
 * WHY IT IS A CLIENT COMPONENT
 * It has to hold state and react to typing. Everything AROUND it — the header,
 * the notice bar, the footer, the page title — stays a Server Component, so
 * the JavaScript the browser downloads is limited to the form itself.
 *
 * Submitting calls `createBooking`, a Server Action. There is no `/api` route
 * and no `fetch()` to write: Next.js turns the function call into a POST for
 * us, and the database credentials never leave the server.
 * ===========================================================================
 */

type Step = 1 | 2 | 3;

type SuccessState = {
  reference: string;
  email: string;
  visitDate: string;
  guests: number;
  emailSent: boolean;
};

export function BookingFlow({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [step, setStep] = useState<Step>(1);
  const [values, setValues] = useState<BookingFormValues>(EMPTY_BOOKING_FORM);
  const [errors, setErrors] = useState<BookingErrors>({});
  /** Numbers that slot into messages, e.g. "only {remaining} places left". */
  const [messageValues, setMessageValues] = useState<Record<string, string | number>>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  /** Incremented on every failed attempt so the error summary re-takes focus. */
  const [focusToken, setFocusToken] = useState(0);
  /** Where to move focus after step 2 → step 1 via an "Edit" link. */
  const pendingFocusField = useRef<BookingFieldName | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Editing a field                                                         */
  /* ---------------------------------------------------------------------- */
  const handleChange = useCallback(
    <K extends keyof BookingFormValues>(field: K, value: BookingFormValues[K]) => {
      setValues((previous) => ({ ...previous, [field]: value }));

      // Clear that field's error as soon as the visitor starts fixing it.
      // Re-validating on every keystroke would shout at someone halfway
      // through typing their email address, which is worse than saying nothing.
      setErrors((previous) => {
        if (!previous[field as BookingFieldName]) return previous;
        const next = { ...previous };
        delete next[field as BookingFieldName];
        return next;
      });
    },
    [],
  );

  /* ---------------------------------------------------------------------- */
  /* Step 1 → Step 2                                                         */
  /* ---------------------------------------------------------------------- */
  function handleNext() {
    // Validate ONLY step 1's fields — the terms tick box is on the next screen
    // and complaining about it now would be baffling.
    const result = validateBooking({ ...values, locale }, STEP_ONE_FIELDS);

    if (!result.success) {
      setErrors(result.errors);
      setFocusToken((n) => n + 1); // pull focus to the summary
      return;
    }

    setErrors({});
    setFormError(undefined);
    setStep(2);
    scrollToTop();
  }

  /* ---------------------------------------------------------------------- */
  /* Step 2 → back to Step 1                                                 */
  /* ---------------------------------------------------------------------- */
  function handleBackToDetails(field?: BookingFieldName) {
    pendingFocusField.current = field ?? null;
    setStep(1);
    scrollToTop();

    // Wait for step 1 to render, then land the cursor on the field the
    // visitor asked to edit.
    if (field) {
      requestAnimationFrame(() => {
        const element = document.getElementById(fieldAnchorId(field));
        element?.focus();
        element?.scrollIntoView({ block: "center", behavior: scrollBehavior() });
      });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Submit                                                                  */
  /* ---------------------------------------------------------------------- */
  async function handleSubmit() {
    // Check everything this time, including the terms tick box.
    const local = validateBooking({ ...values, locale });
    if (!local.success) {
      setErrors(local.errors);
      setFocusToken((n) => n + 1);
      return;
    }

    /* The static preview has no server to receive the booking. Say so, rather
       than showing a generic failure the visitor might blame themselves for. */
    if (IS_STATIC_DEMO) {
      setFormError(resolveErrorMessage("demo", dict));
      setFocusToken((n) => n + 1);
      scrollToTop();
      return;
    }

    setIsSubmitting(true);
    setFormError(undefined);
    setErrors({});

    try {
      const result = await createBooking({ ...values, locale });

      if (result.status === "success") {
        setSuccess({
          reference: result.reference,
          email: result.email,
          visitDate: result.visitDate,
          guests: result.guests,
          emailSent: result.emailSent,
        });
        setStep(3);
        scrollToTop();
        return;
      }

      if (result.status === "invalid") {
        setErrors(result.errors);
        setMessageValues(result.messageValues ?? {});
        setFocusToken((n) => n + 1);
        return;
      }

      setFormError(resolveErrorMessage(result.errorKey, dict));
      setFocusToken((n) => n + 1);
    } catch {
      // The Server Action itself could not be reached — usually offline.
      setFormError(resolveErrorMessage("network", dict));
      setFocusToken((n) => n + 1);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Start again                                                             */
  /* ---------------------------------------------------------------------- */
  function handleBookAnother() {
    setValues(EMPTY_BOOKING_FORM);
    setErrors({});
    setMessageValues({});
    setFormError(undefined);
    setSuccess(null);
    setStep(1);
    scrollToTop();
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */
  const summaryItems = errorSummaryItems(errors, dict, messageValues);

  return (
    <div className="page-shell py-8 sm:py-12">
      {/* --------------------------- Page heading --------------------------- */}
      {/* The back arrow from the design. Its meaning changes with the step, so
          its ELEMENT changes too:
            step 1 → a Link, because it leaves for another page;
            step 2 → a button, because it moves back inside this page. */}
      <div className="flex items-center gap-4">
        {step === 1 && (
          <Link
            href="/visit"
            aria-label={dict.booking.backToVisit}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-3xl leading-none text-brand-brown transition-colors hover:bg-surface-parchment"
          >
            <span aria-hidden="true">←</span>
          </Link>
        )}
        {step === 2 && (
          <button
            type="button"
            onClick={() => handleBackToDetails()}
            aria-label={dict.booking.backToDetails}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-3xl leading-none text-brand-brown transition-colors hover:bg-surface-parchment"
          >
            <span aria-hidden="true">←</span>
          </button>
        )}
        {/* On the confirmation screen there is nothing to go back to, so the
            arrow's space is kept but left empty. */}
        {step === 3 && <span className="h-12 w-12 shrink-0" aria-hidden="true" />}

        <h1 className="font-serif text-2xl text-brand-brown sm:text-[32px]">
          {dict.booking.pageTitle}
        </h1>
      </div>

      <div className="mt-8">
        <StepIndicator current={step} total={3} dict={dict} />

        {/* A whole-form failure (database down, offline) sits above the field
            errors, because it is not attached to any one input. */}
        {formError && (
          <p
            role="alert"
            className="mb-6 flex items-start gap-2 rounded-lg border-2 border-danger bg-white/70 p-4 font-sans text-sm font-medium text-danger"
          >
            <span aria-hidden="true">⚠</span>
            <span>{formError}</span>
          </p>
        )}

        {step !== 3 && (
          <ErrorSummary items={summaryItems} dict={dict} focusToken={focusToken} />
        )}

        {step === 1 && (
          <GuestDetailsStep
            values={values}
            errors={errors}
            messageValues={messageValues}
            onChange={handleChange}
            onNext={handleNext}
            dict={dict}
            locale={locale}
          />
        )}

        {step === 2 && (
          <ReviewStep
            values={values}
            errors={errors}
            messageValues={messageValues}
            onAcceptedTermsChange={(accepted) => handleChange("acceptedTerms", accepted)}
            onEditField={handleBackToDetails}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            dict={dict}
            locale={locale}
          />
        )}

        {step === 3 && success && (
          <SuccessStep
            {...success}
            onBookAnother={handleBookAnother}
            dict={dict}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* -------------------------------------------------------------------------- */

/** "smooth" normally, "auto" for anyone who asked for reduced motion. */
function scrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/** Move the viewport back to the top when the step changes. */
function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
}
