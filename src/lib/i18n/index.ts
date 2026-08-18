import "server-only";
import { cookies, headers } from "next/headers";

import { en, type Dictionary } from "./dictionaries/en";
import { zhHant } from "./dictionaries/zh-Hant";
import { DEFAULT_LOCALE, LOCALE_COOKIE, parseLocale, type Locale } from "./config";

export type { Locale } from "./config";
export type { Dictionary } from "./dictionaries/en";

/**
 * ===========================================================================
 * TRANSLATION LOOKUP (server side)
 * ===========================================================================
 * Server Components call `getLocale()` / `getDictionary()`, then pass the
 * finished `dict` object down to Client Components as a plain prop.
 *
 * Why props instead of a React context? Because a plain object crosses the
 * server/client boundary for free, needs no provider, and means a Client
 * Component can be tested by simply handing it a dictionary.
 * ===========================================================================
 */

/**
 * Recursively lays `override` on top of `base`.
 * Any key missing from the translation keeps its English value.
 */
function mergeDictionary<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (typeof base !== "object" || base === null) return override as T;
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    result[key] = mergeDictionary((base as Record<string, unknown>)[key], value);
  }
  return result as T;
}

/** Ready-made dictionaries, built once when the module first loads. */
const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  "zh-Hant": mergeDictionary(en, zhHant),
};

/**
 * Works out which language to show, in priority order:
 *
 *   1. The cookie set by the 中 / Eng switcher — an explicit choice always wins.
 *   2. The browser's own `Accept-Language` header — this is the "follow the
 *      user's device language" behaviour.
 *   3. English.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  if (acceptLanguage) {
    // "zh-HK,zh;q=0.9,en;q=0.8" -> ["zh-HK", "zh", "en"] in preference order.
    const preferred = acceptLanguage
      .split(",")
      .map((part) => ({
        tag: part.split(";")[0]?.trim() ?? "",
        quality: Number(part.split(";q=")[1] ?? 1),
      }))
      .sort((a, b) => b.quality - a.quality);

    for (const { tag } of preferred) {
      const match = parseLocale(tag);
      if (match) return match;
    }
  }

  return DEFAULT_LOCALE;
}

/** Fetch the full set of strings for one language. */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/** Convenience: read the locale and its dictionary in one call. */
export async function getTranslation(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}
