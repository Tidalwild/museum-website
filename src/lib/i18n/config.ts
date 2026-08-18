/**
 * ===========================================================================
 * LANGUAGE CONFIGURATION
 * ===========================================================================
 * The site is bilingual: English ("en") and Traditional Chinese ("zh-Hant").
 * English is complete today; Chinese is added by filling in
 * `dictionaries/zh-Hant.ts`. Any key you have not translated yet automatically
 * falls back to English, so the site never shows an empty string.
 * ===========================================================================
 */

export const LOCALES = ["en", "zh-Hant"] as const;
export type Locale = (typeof LOCALES)[number];

/** Used when we cannot work out what the visitor wants. */
export const DEFAULT_LOCALE: Locale = "en";

/**
 * The cookie that remembers an explicit choice from the 中 / Eng switcher.
 * An explicit choice always beats the browser's own language setting.
 */
export const LOCALE_COOKIE = "syum_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year

/** Short labels shown in the header language switcher. */
export const LOCALE_SWITCHER = [
  { locale: "zh-Hant" as const, label: "中", fullName: "繁體中文" },
  { locale: "en" as const, label: "Eng", fullName: "English" },
];

/** The `lang` attribute we put on <html>. Screen readers use it to pick a voice. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  "zh-Hant": "zh-Hant-HK",
};

/** Narrow an untrusted string (cookie value, header value) to a real locale. */
export function parseLocale(value: string | undefined | null): Locale | null {
  if (!value) return null;
  const normalised = value.toLowerCase();
  if (normalised.startsWith("zh")) return "zh-Hant";
  if (normalised.startsWith("en")) return "en";
  return null;
}
