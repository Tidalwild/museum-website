import type { ReactNode } from "react";

/**
 * The large rounded panel that holds the booking form and the review summary.
 * Matches the soft cream card with a hairline border from the design.
 */
export function BookingCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-surface-card p-5 shadow-card sm:p-8 lg:p-10">
      {children}
    </div>
  );
}

/**
 * "Guest Information" / "Terms and Conditions" — the brown section headings
 * inside the card.
 *
 * `as` lets you keep the heading LEVELS in order (h2 → h3 → h4) without
 * changing how they look. Skipping a level breaks the outline that screen
 * reader users navigate by, so never pick a level for its font size.
 */
export function SectionHeading({
  children,
  as: Tag = "h2",
  id,
  trailing,
}: {
  children: ReactNode;
  as?: "h2" | "h3" | "h4";
  id?: string;
  /** Optional content shown to the right, e.g. the red "✱ must fill" legend. */
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <Tag id={id} className="font-serif text-xl font-bold text-brand-brown sm:text-[22px]">
        {children}
      </Tag>
      {trailing}
    </div>
  );
}
