import { ButtonLink, PlayGlyph } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * "WELCOME TO SYU HISTORY MUSEUM" — the centred introduction and the
 * "Learn More ▶" pill from the design.
 *
 * "Learn More" NAVIGATES to /about, so it is a link (ButtonLink), not a
 * button, even though it is drawn as a filled pill.
 */
export function WelcomeSection({ dict }: { dict: Dictionary }) {
  return (
    <section aria-labelledby="welcome-heading" className="page-shell py-14 text-center sm:py-20">
      <h1
        id="welcome-heading"
        className="font-serif text-2xl font-bold uppercase tracking-wide text-brand-brown sm:text-4xl"
      >
        {dict.home.welcomeTitle}
      </h1>

      {/* `max-w-3xl` keeps the line length around 75 characters, which is the
          comfortable reading measure WCAG 1.4.8 recommends. */}
      <p className="mx-auto mt-8 max-w-3xl font-serif text-[15px] leading-[2] text-ink sm:text-base">
        {dict.home.welcomeBody}
      </p>

      <div className="mt-10">
        <ButtonLink href="/about" size="md" aria-label={dict.home.learnMoreAccessibleLabel}>
          {dict.home.learnMore}
          <PlayGlyph />
        </ButtonLink>
      </div>
    </section>
  );
}
