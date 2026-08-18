/**
 * ===========================================================================
 * VALIDATION SELF-CHECK   —   run with:  npm run check:validation
 * ===========================================================================
 * A small safety net rather than a full test suite.
 *
 * Every error the schema produces is a KEY (like "emailInvalid") that must
 * also exist in `dict.booking.errors`. If one is renamed in one place and not
 * the other, the visitor sees the generic "something went wrong" message
 * instead of the real reason — and nothing in the normal build would catch it.
 *
 * This script feeds deliberately broken input through the real schema and
 * asserts that every message it produces is a real dictionary key.
 *
 * Add a case here whenever you add a rule to `src/lib/booking/schema.ts`.
 * ===========================================================================
 */
import { en } from "../src/lib/i18n/dictionaries/en";
import { validateBooking, type BookingFormValues } from "../src/lib/booking/schema";

const errorKeys = new Set(Object.keys(en.booking.errors));
let failures = 0;

function check(name: string, values: Partial<BookingFormValues>, expectedField: string | null) {
  const { errors } = validateBooking(values);
  const summary =
    Object.entries(errors)
      .map(([field, key]) => `${field}=${key}`)
      .sort()
      .join(", ") || "(valid)";

  // 1. Every message must be a real dictionary key.
  for (const key of Object.values(errors)) {
    if (!errorKeys.has(key as string)) {
      console.error(`  ✗ "${key}" is not a key in dict.booking.errors`);
      failures += 1;
    }
  }

  // 2. The field we broke must actually be flagged.
  if (expectedField && !(expectedField in errors)) {
    console.error(`  ✗ ${name}: expected an error on "${expectedField}", got ${summary}`);
    failures += 1;
    return;
  }
  if (!expectedField && Object.keys(errors).length > 0) {
    console.error(`  ✗ ${name}: expected NO errors, got ${summary}`);
    failures += 1;
    return;
  }

  console.log(`  ✓ ${name.padEnd(30)} ${summary}`);
}

/** A date that is bookable: tomorrow, skipping Mondays (the museum is closed). */
function nextOpenDay(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 1) date.setDate(date.getDate() + 1);
  return toISO(date);
}

/** The next Monday — always rejected, because the museum is closed. */
function nextMonday(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() !== 1) date.setDate(date.getDate() + 1);
  return toISO(date);
}

function toISO(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

const valid: BookingFormValues = {
  firstName: "John",
  lastName: "Doe",
  phoneCountryCode: "+852",
  phone: "1234 5678",
  email: "johndoe2026@gmail.com",
  visitDate: nextOpenDay(),
  guests: 2,
  referralSource: "social_media",
  acceptedTerms: true,
};

console.log("\nBooking validation self-check");
console.log("-".repeat(62));

check("happy path", valid, null);
check("first name blank", { ...valid, firstName: "   " }, "firstName");
check("last name blank", { ...valid, lastName: "" }, "lastName");
check("phone not digits", { ...valid, phone: "call me" }, "phone");
check("phone too short", { ...valid, phone: "123" }, "phone");
check("phone with spaces ok", { ...valid, phone: "1234 5678" }, null);
check("phone with dashes ok", { ...valid, phone: "1234-5678" }, null);
check("country code unknown", { ...valid, phoneCountryCode: "+999" }, "phoneCountryCode");
check("email malformed", { ...valid, email: "not-an-email" }, "email");
check("email blank", { ...valid, email: "" }, "email");
check("date blank", { ...valid, visitDate: "" }, "visitDate");
check("date in the past", { ...valid, visitDate: "2020-01-01" }, "visitDate");
check("date too far ahead", { ...valid, visitDate: "2099-01-01" }, "visitDate");
check("date is a Monday", { ...valid, visitDate: nextMonday() }, "visitDate");
check("date not real", { ...valid, visitDate: "2026-02-31" }, "visitDate");
check("guests zero", { ...valid, guests: 0 }, "guests");
check("guests too many", { ...valid, guests: 999 }, "guests");
check("referral blank", { ...valid, referralSource: "" }, "referralSource");
check("referral tampered", { ...valid, referralSource: "<script>" }, "referralSource");
check("terms not ticked", { ...valid, acceptedTerms: false }, "acceptedTerms");
check(
  "empty form",
  {
    firstName: "",
    lastName: "",
    phoneCountryCode: "",
    phone: "",
    email: "",
    visitDate: "",
    guests: 0,
    referralSource: "",
    acceptedTerms: false,
  },
  "firstName",
);

console.log("-".repeat(62));

if (failures > 0) {
  console.error(`\n${failures} problem(s) found.\n`);
  process.exit(1);
}
console.log("All validation messages map to real dictionary keys.\n");
