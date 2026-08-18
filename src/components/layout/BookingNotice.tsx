import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * The brown warning strip under the header on the booking pages:
 * "Please ensure all information is accurate…".
 *
 * It is a complementary landmark rather than an alert: this is standing
 * advice, not a response to something the visitor just did, so it must NOT
 * interrupt a screen reader mid-sentence.
 *
 * The ⚠ glyph is decorative: the sentence already carries the whole message.
 */
export function BookingNotice({ dict }: { dict: Dictionary }) {
  return (
    /* <aside> makes this a "complementary" landmark, so a screen-reader user
       can jump to it (or skip it) by landmark.
       Deliberately NOT role="alert": this is standing advice shown on arrival,
       not a response to something the visitor just did, so it must not
       interrupt whatever is being read out. (It is also not role="note" —
       that role would REPLACE the landmark and put the strip back outside
       every landmark on the page.) */
    <aside aria-label={dict.bookingNotice.regionLabel} className="bg-brand-brown">
      <div className="page-shell flex items-start gap-2.5 py-2">
        <span aria-hidden="true" className="pt-px text-sm text-surface-cream">
          ⚠
        </span>
        <p className="font-serif text-[13px] leading-snug text-surface-cream sm:text-sm">
          {dict.bookingNotice.text}
        </p>
      </div>
    </aside>
  );
}
