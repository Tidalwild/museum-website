import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { SectionHeading } from "./BookingCard";

/**
 * The "Terms and Conditions" block inside the review card.
 *
 * The content is DATA (`dict.booking.termsSections`), not hard-coded JSX, so
 * the museum's legal team can edit the wording in one dictionary file and it
 * translates like everything else.
 *
 * Each group is a real <h4> followed by a real <ul>. That matters: a screen
 * reader user can then jump heading-to-heading through "Reservations",
 * "Photography", "Liability" instead of listening to the whole block.
 */
export function TermsAndConditions({ dict }: { dict: Dictionary }) {
  return (
    <section aria-labelledby="terms-heading" className="mt-10">
      <SectionHeading as="h3" id="terms-heading">
        {dict.booking.termsTitle}
      </SectionHeading>

      <div className="mt-4 space-y-4">
        {dict.booking.termsSections.map((section) => (
          <div key={section.heading}>
            <h4 className="font-serif text-[13px] font-bold text-ink">{section.heading}</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 font-serif text-[13px] leading-relaxed text-ink/90">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
