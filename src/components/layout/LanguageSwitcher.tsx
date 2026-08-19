"use client";

import { useTransition } from "react";

import { IS_STATIC_DEMO } from "@/config/demo";
import { setLocale } from "@/lib/i18n/actions";
import { LOCALE_SWITCHER, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * ===========================================================================
 * 中 / Eng LANGUAGE SWITCHER
 * ===========================================================================
 * These are BUTTONS, not links. They do not navigate anywhere — they change a
 * setting and re-render the page you are already on. Marking them up as links
 * would tell screen-reader users to expect a new page, which is not what
 * happens.
 *
 * Accessibility notes:
 *  • `aria-current="true"` marks the language you are already using, so a
 *    screen reader says "current" rather than relying on the brighter colour.
 *  • The active language is also underlined — colour is never the only signal.
 *  • Each button carries a full `aria-label` ("Switch to 繁體中文") because
 *    "中" on its own is not a sentence.
 * ===========================================================================
 */
export function LanguageSwitcher({
  currentLocale,
  dict,
}: {
  currentLocale: Locale;
  dict: Dictionary;
}) {
  // `useTransition` keeps the page interactive while the server re-renders,
  // and gives us `isPending` so we can dim the control instead of freezing.
  const [isPending, startTransition] = useTransition();

  /* The static preview has no server to remember a language choice, so the
     switcher would be a button that silently does nothing. Hide it there; the
     preview banner says the preview is English only. */
  if (IS_STATIC_DEMO) return null;

  return (
    <div className="flex items-center gap-3" role="group" aria-label={dict.header.languageNavLabel}>
      {LOCALE_SWITCHER.map(({ locale, label, fullName }) => {
        const isCurrent = locale === currentLocale;

        return (
          <button
            key={locale}
            type="button"
            lang={locale === "zh-Hant" ? "zh-Hant" : "en"}
            aria-current={isCurrent ? "true" : undefined}
            aria-label={
              isCurrent
                ? `${dict.header.currentLanguage}: ${fullName}`
                : `${dict.header.languageSwitchTo} ${fullName}`
            }
            disabled={isPending}
            onClick={() => startTransition(() => setLocale(locale))}
            className={[
              "min-h-[44px] px-1 font-serif text-[15px] transition-opacity",
              isCurrent
                ? "font-semibold text-white underline decoration-2 underline-offset-[6px]"
                : "text-white/85 hover:text-white hover:underline hover:underline-offset-[6px]",
              isPending ? "opacity-60" : "",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
