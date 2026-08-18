"use client";

import type { ReactNode } from "react";

/**
 * ===========================================================================
 * FIELD — the accessible wrapper every form control on the site uses
 * ===========================================================================
 * Wiring a form control up correctly means four things must line up:
 *
 *   1. <label htmlFor>            connects the label to the input, so clicking
 *                                 the label focuses the input and a screen
 *                                 reader reads the label when you tab in.
 *   2. aria-describedby           points at the help text AND the error, so
 *                                 both are read out after the label.
 *   3. aria-invalid               tells assistive tech the value is rejected.
 *   4. A visible error message    with an icon and words — never colour alone
 *                                 (WCAG 1.4.1 Use of Colour).
 *
 * Doing that by hand on eight inputs is where mistakes creep in, so this
 * component does it once and hands the ids back to you.
 *
 *   <Field id="email" label="Email Address" required error={...}>
 *     {({ inputProps }) => <input {...inputProps} />}
 *   </Field>
 * ===========================================================================
 */

export type FieldRenderProps = {
  /** Spread these straight onto your <input>, <select> or custom control. */
  inputProps: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
    "aria-required": boolean | undefined;
  };
};

type FieldProps = {
  /** Must be unique on the page — it becomes the input's `id`. */
  id: string;
  label: string;
  /** Adds the red asterisk, the "(required)" text, and aria-required. */
  required?: boolean;
  /** Read out by screen readers straight after "required". */
  requiredSuffix?: string;
  /** Optional guidance shown under the label, e.g. the email warning. */
  help?: ReactNode;
  /** A ready-translated error sentence, or undefined when the field is fine. */
  error?: string;
  /** Extra classes on the wrapper — handy for grid placement. */
  className?: string;
  children: (props: FieldRenderProps) => ReactNode;
};

export function Field({
  id,
  label,
  required = false,
  requiredSuffix = "required",
  help,
  error,
  className,
  children,
}: FieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  // Order matters: help is read before the error.
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block font-serif text-[15px] text-ink">
        {required && (
          <>
            {/* The asterisk is decorative; the real information is the
                sr-only "(required)" text right after it, so people who
                cannot see red still know the field is mandatory. */}
            <span aria-hidden="true" className="mr-1 text-danger">
              ✱
            </span>
            <span className="sr-only">({requiredSuffix}) </span>
          </>
        )}
        {label}:
      </label>

      {help && (
        <p id={helpId} className="mt-1 font-sans text-xs italic leading-snug text-danger">
          {help}
        </p>
      )}

      <div className="mt-1.5">
        {children({
          inputProps: {
            id,
            "aria-describedby": describedBy,
            "aria-invalid": error ? true : undefined,
            "aria-required": required || undefined,
          },
        })}
      </div>

      {error && (
        /* role="alert" makes a screen reader announce the message the moment
           it appears, without the visitor having to go looking for it. */
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 font-sans text-sm font-medium text-danger"
        >
          <span aria-hidden="true" className="leading-5">
            ⚠
          </span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Shared input styling. Kept here so every text box, select and stepper on the
 * site looks the same and you only have to change one string to restyle them.
 *
 * `border` (not just a background tint) is deliberate: WCAG 1.4.11 asks for
 * 3:1 contrast on the boundary of a form control, and a tinted box alone
 * cannot pass that.
 */
export const INPUT_BASE_CLASSES =
  "rounded-md border border-line bg-white/85 px-3 py-2.5 " +
  "font-serif text-[15px] text-ink placeholder:text-brand-brown-soft/80 " +
  "shadow-card transition-colors " +
  "hover:border-brand-brown/60 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:border-2";

/**
 * The same styling plus `w-full`, which is what almost every control wants.
 * Use INPUT_BASE_CLASSES directly when you need to set your own width — the
 * phone country-code <select>, for example.
 */
export const INPUT_CLASSES = `w-full ${INPUT_BASE_CLASSES}`;
