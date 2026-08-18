import { BOOKING_RULES } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/format";
import type { BookingErrors, BookingFieldName } from "./schema";

/**
 * Turns an error KEY from the validation schema (e.g. "dateTooFar") into a
 * finished sentence in the visitor's language.
 *
 * Keeping keys in the schema and sentences in the dictionary is what makes the
 * form bilingual for free: the schema never knows what language it is in.
 */
export function resolveErrorMessage(
  key: string | undefined,
  dict: Dictionary,
  values: Record<string, string | number> = {},
): string | undefined {
  if (!key) return undefined;

  const messages = dict.booking.errors as Record<string, string>;
  const template = messages[key];

  // A missing key should be obvious in development rather than silently blank.
  if (!template) return messages.unexpected;

  return interpolate(template, {
    min: BOOKING_RULES.minGuests,
    max: BOOKING_RULES.maxGuests,
    days: BOOKING_RULES.maxDaysAhead,
    ...values,
  });
}

/** The visible label of a field, used by the error summary links. */
export function fieldLabel(field: BookingFieldName, dict: Dictionary): string {
  const f = dict.booking.fields;
  const labels: Record<BookingFieldName, string> = {
    firstName: f.firstName,
    lastName: f.lastName,
    phoneCountryCode: f.phoneCountryCode,
    phone: f.phone,
    email: f.email,
    visitDate: f.date,
    guests: f.guests,
    referralSource: f.referral,
    acceptedTerms: dict.booking.termsTitle,
  };
  return labels[field];
}

/** Builds the list the error summary box renders, in the form's own order. */
export function errorSummaryItems(
  errors: BookingErrors,
  dict: Dictionary,
  values: Record<string, string | number> = {},
): Array<{ field: BookingFieldName; label: string; message: string }> {
  const order: BookingFieldName[] = [
    "firstName",
    "lastName",
    "phoneCountryCode",
    "phone",
    "email",
    "visitDate",
    "guests",
    "referralSource",
    "acceptedTerms",
  ];

  return order
    .filter((field) => errors[field])
    .map((field) => ({
      field,
      label: fieldLabel(field, dict),
      message: resolveErrorMessage(errors[field], dict, values) ?? "",
    }));
}
