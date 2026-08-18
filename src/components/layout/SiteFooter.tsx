import { SITE } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { MuseumWordmark } from "./MuseumWordmark";

/**
 * ===========================================================================
 * SITE FOOTER
 * ===========================================================================
 * Three columns from the design — wordmark | Opening Hours | Contact Us —
 * over the same green-to-navy gradient as the header, with a copyright line
 * and a "Return to the top" anchor beneath.
 *
 * The two thin vertical rules between columns are `aria-hidden` decoration.
 * The real structure comes from the two <h2> headings, which let a screen
 * reader user jump between "Opening Hours" and "Contact Us" directly.
 * ===========================================================================
 */
export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer
      className="on-dark bg-gradient-to-r from-brand-green to-brand-navy"
      aria-label={dict.footer.label}
    >
      <div className="page-shell py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-[1.1fr_auto_1fr_auto_1.1fr] sm:items-start">
          {/* Column 1 — wordmark */}
          <div className="flex items-center sm:min-h-[120px]">
            <MuseumWordmark
              chinese={dict.header.museumNameChinese}
              english={dict.header.museumNameEnglish}
              size="sm"
            />
          </div>

          <span aria-hidden="true" className="hidden w-px self-stretch bg-white/25 sm:block" />

          {/* Column 2 — opening hours */}
          <section>
            <h2 className="font-serif text-lg font-semibold tracking-wide text-white">
              {dict.footer.openingHoursTitle}
            </h2>
            {/* A real list, so a screen reader says "list, 3 items". */}
            <ul className="mt-3 space-y-1.5 font-serif text-sm text-white/85">
              <li>{dict.footer.hoursTueThu}</li>
              <li>{dict.footer.hoursFriSun}</li>
              <li>{dict.footer.hoursClosed}</li>
            </ul>
          </section>

          <span aria-hidden="true" className="hidden w-px self-stretch bg-white/25 sm:block" />

          {/* Column 3 — contact */}
          <section>
            <h2 className="font-serif text-lg font-semibold tracking-wide text-white">
              {dict.footer.contactTitle}
            </h2>
            {/* <address> is the correct element for contact details. */}
            <address className="mt-3 font-serif text-sm not-italic leading-relaxed text-white/85">
              {SITE.address.line1}
              <br />
              {SITE.address.line2}
            </address>
            <p className="mt-3">
              <a
                href={SITE.address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-sm text-white/90 underline underline-offset-4 hover:text-white"
              >
                {dict.footer.viewOnMaps}
                {/* Warns screen-reader users before the link steals focus to
                    a new tab (WCAG 3.2.5 Change on Request). */}
                <span className="sr-only"> ({dict.footer.opensInNewTab})</span>
              </a>
            </p>
          </section>
        </div>

        <hr className="mt-10 border-white/15" />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-serif text-xs text-white/70">{dict.footer.copyright}</p>
          {/* An in-page anchor: still a link, because it changes the URL hash
              and works with browser history. */}
          <a
            href="#top"
            className="font-serif text-xs text-white/80 underline underline-offset-4 hover:text-white"
          >
            {dict.footer.backToTop} <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
