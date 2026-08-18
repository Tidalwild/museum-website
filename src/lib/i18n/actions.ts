"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES, type Locale } from "./config";

/**
 * Remembers the visitor's language choice in a cookie and re-renders the page.
 *
 * A cookie (rather than a `/en` / `/zh` URL prefix) keeps every route simple:
 * there is exactly one `/book` page, not two. If the museum later needs
 * language-specific URLs for SEO, move to Next.js's `[locale]` segment — the
 * dictionaries and components will not need to change.
 */
export async function setLocale(locale: Locale): Promise<void> {
  if (!LOCALES.includes(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    // This cookie holds no secrets, so the browser may read it too.
    httpOnly: false,
  });

  // Re-render every page so the new language takes effect immediately.
  revalidatePath("/", "layout");
}
