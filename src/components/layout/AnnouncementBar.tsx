import Link from "next/link";

import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * ===========================================================================
 * ANNOUNCEMENT BAR (home page only)
 * ===========================================================================
 * From the design: a cream strip directly under the header reading
 *
 *      →   Book Your Visit Now   ( Register )   ←
 *
 * The two arrows point inwards at the call to action. They are pure
 * decoration, so they are `aria-hidden` and they stop moving entirely when the
 * visitor has asked for reduced motion (handled globally in globals.css).
 *
 * "Register" NAVIGATES to /book, so it is a Link styled as a pill — not a
 * <button>.
 * ===========================================================================
 */
export function AnnouncementBar({ dict }: { dict: Dictionary }) {
  return (
    /* <aside> makes this a "complementary" landmark. Without it, this strip
       is content that sits outside every landmark on the page — which means a
       screen-reader user navigating by landmark would skip straight over the
       "Register" call to action. */
    <aside
      aria-label={dict.announcement.regionLabel}
      className="border-b border-line-soft bg-surface-parchment"
    >
      <div className="page-shell flex items-center justify-center gap-3 py-2.5 sm:gap-5">
        <span
          aria-hidden="true"
          className="hidden text-brand-brown motion-safe:animate-nudge-right sm:inline"
        >
          ⟶
        </span>

        <p className="font-serif text-[15px] text-ink sm:text-base">{dict.announcement.message}</p>

        <Link
          href="/book"
          aria-label={dict.announcement.ctaAccessibleLabel}
          className="inline-flex min-h-[36px] items-center rounded-pill border border-brand-brown/70 px-5 py-1 font-serif text-sm text-brand-brown transition-colors hover:bg-brand-brown hover:text-surface-cream"
        >
          {dict.announcement.cta}
        </Link>

        <span
          aria-hidden="true"
          className="hidden text-brand-brown motion-safe:animate-nudge-left sm:inline"
        >
          ⟵
        </span>
      </div>
    </aside>
  );
}
