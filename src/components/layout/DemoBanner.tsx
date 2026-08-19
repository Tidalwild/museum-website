import { IS_STATIC_DEMO } from "@/config/demo";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * A strip across the top of the STATIC PREVIEW build only, saying what this
 * copy of the site is and is not.
 *
 * Renders nothing in a normal build, so the real site never shows it.
 *
 * It exists because a preview that silently fails to take a booking looks
 * broken; one that says "bookings are not open yet" looks deliberate.
 */
export function DemoBanner({ dict }: { dict: Dictionary }) {
  if (!IS_STATIC_DEMO) return null;

  return (
    <aside
      aria-label={dict.demoBanner.label}
      className="border-b border-brand-navy/30 bg-brand-navy"
    >
      <p className="page-shell py-2 text-center font-sans text-[13px] leading-snug text-white">
        <span aria-hidden="true" className="mr-1.5">
          ●
        </span>
        {dict.demoBanner.text}
      </p>
    </aside>
  );
}
