import Link from "next/link";

import { MAIN_NAV } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MuseumWordmark } from "./MuseumWordmark";

/**
 * ===========================================================================
 * SITE HEADER — the dark green bar at the top of every page
 * ===========================================================================
 * From the design: a left-to-right gradient from museum green into navy, the
 * wordmark on the left, and Home / About / Visit plus the 中 | Eng switcher on
 * the right, separated by a thin vertical rule.
 *
 * Behaviour:
 *  • The wordmark and Home / About / Visit are LINKS — they navigate.
 *  • 中 and Eng are BUTTONS — they change a setting. See LanguageSwitcher.
 *
 * `.on-dark` switches the global focus ring to a light colour so it stays
 * visible against the dark background (see globals.css).
 *
 * This is a Server Component: it renders on the server and ships no
 * JavaScript. Only the little language switcher inside it is interactive.
 * ===========================================================================
 */
export function SiteHeader({
  locale,
  dict,
  currentPath,
}: {
  locale: Locale;
  dict: Dictionary;
  /** Used to mark the active nav item with aria-current="page". */
  currentPath?: string;
}) {
  return (
    <header className="on-dark bg-gradient-to-r from-brand-green to-brand-navy">
      <div className="page-shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
        {/* Wordmark → home. A link, because it navigates. */}
        <Link
          href="/"
          aria-label={dict.header.homeLinkLabel}
          className="rounded-sm py-1 transition-opacity hover:opacity-90"
        >
          <MuseumWordmark
            chinese={dict.header.museumNameChinese}
            english={dict.header.museumNameEnglish}
          />
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav aria-label={dict.header.primaryNavLabel}>
            <ul className="flex items-center gap-4 sm:gap-7">
              {MAIN_NAV.map((item) => {
                const isCurrent = currentPath === item.href;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      /* aria-current="page" is how a screen reader announces
                         "you are here" — the underline is the visual twin. */
                      aria-current={isCurrent ? "page" : undefined}
                      className={[
                        "inline-flex min-h-[44px] items-center font-serif text-[15px] sm:text-base",
                        isCurrent
                          ? "text-white underline decoration-2 underline-offset-[6px]"
                          : "text-white/90 hover:text-white hover:underline hover:underline-offset-[6px]",
                      ].join(" ")}
                    >
                      {dict.nav[item.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* The thin rule between the nav and the language switcher.
              Decorative, so it is hidden from assistive technology. */}
          <span aria-hidden="true" className="h-5 w-px bg-white/40" />

          <LanguageSwitcher currentLocale={locale} dict={dict} />
        </div>
      </div>
    </header>
  );
}
