import { z } from "zod";

import { BOOKING_RULES, PHONE_COUNTRY_CODES, REFERRAL_SOURCES } from "@/config/site";
import { checkDateAvailability } from "./dates";

/**
 * ===========================================================================
 * BOOKING VALIDATION
 * ===========================================================================
 * ONE schema, used in TWO places:
 *
 *   • in the browser, so the visitor sees mistakes immediately; and
 *   • on the server, before anything touches the database.
 *
 * The browser check is a courtesy — it can be bypassed. The server check is
 * the one that actually protects the data, which is why the server action
 * re-runs this exact schema on whatever arrives.
 *
 * Errors are returned as translation KEYS (e.g. "emailInvalid"), not English
 * sentences, so the same schema produces Chinese messages once the Chinese
 * dictionary is filled in.
 * ===========================================================================
 */

const countryCodes = PHONE_COUNTRY_CODES.map((c) => c.code) as [string, ...string[]];
const referralValues = REFERRAL_SOURCES.map((r) => r.value) as [string, ...string[]];

/** Hong Kong-friendly phone check: 6–15 digits once spaces/dashes are stripped. */
const PHONE_PATTERN = /^\d{6,15}$/;

export const bookingSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "firstNameRequired" })
    .max(60, { message: "firstNameTooLong" }),

  lastName: z
    .string()
    .trim()
    .min(1, { message: "lastNameRequired" })
    .max(60, { message: "lastNameTooLong" }),

  /* `.refine()` rather than `z.enum()` because z.enum's own message option is
     not honoured in every Zod 3.x release — and a silently-default message
     would not match a key in the dictionary. */
  phoneCountryCode: z
    .string()
    .refine((value) => countryCodes.includes(value), { message: "phoneInvalid" }),

  phone: z
    .string()
    .trim()
    .min(1, { message: "phoneRequired" })
    // People naturally type "1234 5678" or "1234-5678"; accept both.
    .transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => PHONE_PATTERN.test(value), { message: "phoneInvalid" }),

  email: z
    .string()
    .trim()
    .min(1, { message: "emailRequired" })
    .email({ message: "emailInvalid" })
    .max(254, { message: "emailInvalid" })
    .transform((value) => value.toLowerCase()),

  visitDate: z
    .string()
    .min(1, { message: "dateRequired" })
    .superRefine((value, ctx) => {
      // Reuse the exact rule the calendar uses to grey days out.
      const reason = checkDateAvailability(value);
      if (!reason) return;
      const messageByReason = {
        invalid: "dateRequired",
        "too-soon": "dateInPast",
        "too-far": "dateTooFar",
        closed: "dateClosed",
      } as const;
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: messageByReason[reason] });
    }),

  guests: z.coerce
    .number({ invalid_type_error: "guestsRange", required_error: "guestsRange" })
    .int({ message: "guestsRange" })
    .min(BOOKING_RULES.minGuests, { message: "guestsRange" })
    .max(BOOKING_RULES.maxGuests, { message: "guestsRange" }),

  referralSource: z
    .string()
    .refine((value) => referralValues.includes(value), { message: "referralRequired" }),

  /** The Terms and Conditions tick box on step 2. Must be exactly `true`. */
  acceptedTerms: z
    .boolean()
    .refine((value) => value === true, { message: "termsRequired" }),

  /** Which language the visitor booked in, so we email them in that language. */
  locale: z
    .enum(["en", "zh-Hant"])
    .catch("en") // an unrecognised value falls back rather than failing the booking
    .default("en"),
});

/** The clean, validated shape the server works with. */
export type BookingInput = z.infer<typeof bookingSchema>;

/** The messy, in-progress shape the form holds while the visitor types. */
export type BookingFormValues = {
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phone: string;
  email: string;
  visitDate: string;
  guests: number;
  referralSource: string;
  acceptedTerms: boolean;
};

/** Everything the form starts with when the page first loads. */
export const EMPTY_BOOKING_FORM: BookingFormValues = {
  firstName: "",
  lastName: "",
  phoneCountryCode: PHONE_COUNTRY_CODES[0].code,
  phone: "",
  email: "",
  visitDate: "",
  guests: BOOKING_RULES.defaultGuests,
  referralSource: "",
  acceptedTerms: false,
};

/**
 * Which fields belong to which step of the flow. Step 1 only validates its own
 * fields, so the visitor is not told off about the tick box they have not
 * reached yet.
 */
export const STEP_ONE_FIELDS = [
  "firstName",
  "lastName",
  "phoneCountryCode",
  "phone",
  "email",
  "visitDate",
  "guests",
  "referralSource",
] as const;

export type BookingFieldName = keyof BookingFormValues;

/** `{ email: "emailInvalid", visitDate: "dateClosed" }` — key per broken field. */
export type BookingErrors = Partial<Record<BookingFieldName, string>>;

/**
 * Runs the schema and flattens Zod's output into a simple
 * `{ fieldName: errorKey }` object, which is much easier to render.
 *
 * @param values   whatever the form currently holds
 * @param fields   optional — validate only these fields (used for step 1)
 */
export function validateBooking(
  values: Partial<BookingFormValues> & { locale?: string },
  fields?: readonly BookingFieldName[],
): { success: boolean; errors: BookingErrors; data?: BookingInput } {
  const parsed = bookingSchema.safeParse(values);

  if (parsed.success) return { success: true, errors: {}, data: parsed.data };

  const errors: BookingErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as BookingFieldName | undefined;
    if (!field) continue;
    if (fields && !fields.includes(field)) continue; // not this step's problem
    // Keep the FIRST error per field — that is the one the visitor should fix.
    if (!errors[field]) errors[field] = issue.message;
  }

  return { success: Object.keys(errors).length === 0, errors };
}
