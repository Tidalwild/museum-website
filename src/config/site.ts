/**
 * ===========================================================================
 * SITE CONFIGURATION — edit this file to change the museum's details
 * ===========================================================================
 * Nothing here is hard-coded inside a component. Opening hours, the address,
 * the navigation links, the booking rules... they all live here so a
 * non-developer can update the site without touching any JSX.
 *
 * NOTE ON TEXT: user-visible *wording* lives in `src/lib/i18n/dictionaries/`
 * (because it has to be translated). This file holds *structural* data —
 * URLs, numbers, dates and rules — which is the same in every language.
 * ===========================================================================
 */

/** The museum's identity, used in the header, footer and email templates. */
export const SITE = {
  /** Shown in the browser tab and in social previews. */
  name: "Shue Yan University History Museum",
  shortName: "SYU History Museum",
  /** Public base URL. Used to build absolute links inside emails. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  address: {
    line1: "Braemar Hill Campus, 10 Wai Tsui Crescent,",
    line2: "Braemar Hill, North Point, Hong Kong",
    /** "View on Google Maps" link in the footer. */
    mapsUrl: "https://maps.google.com/?q=Hong+Kong+Shue+Yan+University",
  },
  /**
   * ⚠️ VERIFY THIS BEFORE THE SITE GOES LIVE.
   *
   * This address is a plausible guess, not a confirmed mailbox. It is printed
   * in the confirmation email every visitor receives ("reply to this email or
   * contact us at ...") and on the screen shown if the email fails to send.
   *
   * If nobody reads this inbox, a visitor trying to change or cancel a booking
   * writes into the void. Replace it with a mailbox someone actually monitors
   * — even a temporary project address is better than one that bounces.
   */
  contactEmail: "museum@hksyu.edu",
} as const;

/**
 * Main navigation. `href` values are real routes — each of these renders as a
 * LINK (an <a>), never a button, because they navigate to a new page.
 */
export const MAIN_NAV = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "visit", href: "/visit" },
] as const;

/**
 * The three image cards on the home page. Each card is a LINK.
 * Swap `image` for a real photo dropped into `public/images/`.
 */
export const HOME_CARDS = [
  { key: "collection", href: "/collection", image: "/images/card-collection.jpg" },
  { key: "events", href: "/events", image: "/images/card-events.jpg" },
  { key: "materials", href: "/materials", image: "/images/card-materials.jpg" },
] as const;

/**
 * ---------------------------------------------------------------------------
 * OPENING HOURS
 * ---------------------------------------------------------------------------
 * `weekday` uses JavaScript's numbering: 0 = Sunday ... 6 = Saturday.
 * `closed: true` days are greyed out and unselectable in the booking calendar,
 * so the opening hours and the calendar can never disagree.
 */
export const OPENING_HOURS = [
  { weekday: 0, closed: false, opens: "10:00", closes: "18:00" }, // Sunday
  { weekday: 1, closed: true, opens: null, closes: null }, //         Monday — closed
  { weekday: 2, closed: false, opens: "10:00", closes: "17:00" }, // Tuesday
  { weekday: 3, closed: false, opens: "10:00", closes: "17:00" }, // Wednesday
  { weekday: 4, closed: false, opens: "10:00", closes: "17:00" }, // Thursday
  { weekday: 5, closed: false, opens: "10:00", closes: "18:00" }, // Friday
  { weekday: 6, closed: false, opens: "10:00", closes: "18:00" }, // Saturday
] as const;

/** Convenience helper used by the calendar: is the museum shut this weekday? */
export function isClosedWeekday(weekday: number): boolean {
  return OPENING_HOURS.find((d) => d.weekday === weekday)?.closed ?? false;
}

/**
 * ---------------------------------------------------------------------------
 * BOOKING RULES
 * ---------------------------------------------------------------------------
 * These numbers drive BOTH the browser-side form and the server-side
 * validation, so the two can never drift apart.
 */
export const BOOKING_RULES = {
  /** Smallest / largest party size a single booking may hold. */
  minGuests: 1,
  maxGuests: 20,
  /** Pre-filled value when the form first opens. */
  defaultGuests: 2,
  /** Visitors may not book for today — give staff at least this much notice. */
  minDaysAhead: 1,
  /** How far into the future the calendar lets people book. */
  maxDaysAhead: 180,
  /**
   * Total visitors the museum can host in one day. The server counts existing
   * bookings for the chosen date and refuses one that would go over.
   * Set to `null` to switch the capacity check off entirely.
   */
  dailyCapacity: 120 as number | null,
} as const;

/** Country codes offered by the phone-number field. */
export const PHONE_COUNTRY_CODES = [
  { code: "+852", labelKey: "hongKong" },
  { code: "+86", labelKey: "mainlandChina" },
  { code: "+853", labelKey: "macau" },
  { code: "+886", labelKey: "taiwan" },
  { code: "+44", labelKey: "unitedKingdom" },
  { code: "+1", labelKey: "unitedStatesCanada" },
] as const;

/**
 * Options for the "How You Heard About Us" dropdown.
 * `value` is what gets stored in the database (never translate it).
 * `labelKey` points at the translated text in the dictionaries.
 */
export const REFERRAL_SOURCES = [
  { value: "social_media", labelKey: "socialMedia" },
  { value: "university_website", labelKey: "universityWebsite" },
  { value: "friend_family_colleague", labelKey: "friendFamilyColleague" },
  { value: "campus_posters", labelKey: "campusPosters" },
  { value: "email_newsletter", labelKey: "emailNewsletter" },
  { value: "search_engine", labelKey: "searchEngine" },
  { value: "other", labelKey: "other" },
] as const;

export type ReferralSourceValue = (typeof REFERRAL_SOURCES)[number]["value"];
