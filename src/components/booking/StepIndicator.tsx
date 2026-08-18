import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/format";

/**
 * "Step 1 of 3 — Your details".
 *
 * Two jobs, both required by WCAG 3.3.x for a multi-step process:
 *  • tell everyone where they are, in WORDS as well as with the filled dots;
 *  • announce the change politely when the step advances.
 *
 * The dots are `aria-hidden` because the sentence above them already carries
 * the meaning — otherwise a screen reader would read the position twice.
 */
export function StepIndicator({
  current,
  total,
  dict,
}: {
  current: 1 | 2 | 3;
  total: number;
  dict: Dictionary;
}) {
  const names = [dict.booking.steps.details, dict.booking.steps.review, dict.booking.steps.done];

  return (
    <div className="mb-6" aria-label={dict.booking.steps.label}>
      <p aria-live="polite" className="font-sans text-sm font-medium text-brand-brown-soft">
        {interpolate(dict.booking.steps.of, { current, total })} — {names[current - 1]}
      </p>

      <ol aria-hidden="true" className="mt-2 flex items-center gap-2">
        {names.map((name, index) => (
          <li
            key={name}
            className={[
              "h-1.5 flex-1 rounded-full transition-colors",
              index < current ? "bg-brand-brown" : "bg-line-soft",
            ].join(" ")}
          />
        ))}
      </ol>
    </div>
  );
}
