import { BOOKING_RULES, isClosedWeekday } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";

/**
 * ===========================================================================
 * DATE HELPERS
 * ===========================================================================
 * Dates are the easiest thing in a booking system to get wrong, so every date
 * in this project is handled as a plain "YYYY-MM-DD" string ("2026-09-01").
 *
 * Why a string and not a `Date`?  A JavaScript `Date` always carries a time
 * and a time zone. A visitor in London and the server in Hong Kong would
 * disagree about which calendar day `new Date()` means. A "YYYY-MM-DD" string
 * has no time zone, so it means the same day everywhere — and it is exactly
 * what Postgres stores in a `date` column.
 *
 * This file has no server-only imports, so the browser and the server run the
 * SAME rules and can never disagree about which dates are bookable.
 * ===========================================================================
 */

/** A calendar day with no time and no time zone, e.g. "2026-09-01". */
export type ISODate = string;

/** Turn a JavaScript Date into "YYYY-MM-DD" using its LOCAL calendar day. */
export function toISODate(date: Date): ISODate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Turn "YYYY-MM-DD" back into a Date fixed at local midday. */
export function fromISODate(value: ISODate): Date {
  const [year, month, day] = value.split("-").map(Number);
  // Midday, not midnight: it keeps the date stable even if a daylight-saving
  // shift moves the clock by an hour.
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/** True if the string really is a calendar date, e.g. rejects "2026-02-31". */
export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = fromISODate(value);
  return toISODate(date) === value;
}

/** Today, as an ISO date. */
export function today(): ISODate {
  return toISODate(new Date());
}

/** Add (or subtract, with a negative number) whole days to an ISO date. */
export function addDays(value: ISODate, days: number): ISODate {
  const date = fromISODate(value);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** The earliest date a visitor may book — see BOOKING_RULES.minDaysAhead. */
export function earliestBookableDate(): ISODate {
  return addDays(today(), BOOKING_RULES.minDaysAhead);
}

/** The latest date a visitor may book — see BOOKING_RULES.maxDaysAhead. */
export function latestBookableDate(): ISODate {
  return addDays(today(), BOOKING_RULES.maxDaysAhead);
}

/** Why a particular date cannot be chosen — or `null` when it is fine. */
export type DateUnavailableReason = "invalid" | "too-soon" | "too-far" | "closed";

/**
 * The single rule that decides whether a date is bookable.
 * The calendar uses it to grey out days; the server uses it to reject
 * anything a tampered-with request might send.
 */
export function checkDateAvailability(value: string): DateUnavailableReason | null {
  if (!isValidISODate(value)) return "invalid";
  if (value < earliestBookableDate()) return "too-soon";
  if (value > latestBookableDate()) return "too-far";
  if (isClosedWeekday(fromISODate(value).getDay())) return "closed";
  return null;
}

/** Shorthand for "can a visitor pick this day?". */
export function isDateBookable(value: string): boolean {
  return checkDateAvailability(value) === null;
}

/**
 * Human-readable date, e.g. "1 September 2026" (en) or "2026年9月1日" (zh-Hant).
 * Uses the browser/Node `Intl` API so we never hand-write month names.
 */
export function formatLongDate(value: ISODate, locale: Locale = "en"): string {
  const intlLocale = locale === "zh-Hant" ? "zh-Hant-HK" : "en-GB";
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fromISODate(value));
}

/** Long form including the weekday — used in the confirmation email. */
export function formatLongDateWithWeekday(value: ISODate, locale: Locale = "en"): string {
  const intlLocale = locale === "zh-Hant" ? "zh-Hant-HK" : "en-GB";
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fromISODate(value));
}
