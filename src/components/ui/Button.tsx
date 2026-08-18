import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * ===========================================================================
 * BUTTON  /  BUTTON-LOOKING LINK
 * ===========================================================================
 * The designs contain two things that look identical but behave differently:
 *
 *   • "Register" and "Learn More"  →  they NAVIGATE. They must be <a> tags,
 *     so they work with middle-click, Ctrl+click, "open in new tab", and are
 *     announced as "link" by a screen reader.
 *
 *   • "Next" and "Submit"          →  they DO something on this page. They
 *     must be <button>, so Space activates them and they are announced as
 *     "button".
 *
 * Getting this wrong is one of the most common accessibility failures on the
 * web, so this file gives you a component for each and they share one look:
 *
 *     <ButtonLink href="/book">Register</ButtonLink>   ← navigates
 *     <Button onClick={next}>Next</Button>             ← acts
 * ===========================================================================
 */

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

/** Tailwind classes shared by both the link and the button versions. */
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill font-serif " +
  "transition-colors duration-150 " +
  // 2.5.8 Target Size (Minimum): every control is at least 24x24 CSS pixels.
  "min-h-[44px] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  /** Filled brown pill — "Learn More", "Next", "Submit". */
  primary: "bg-brand-brown text-surface-cream hover:bg-brand-brown-hover",
  /** Outlined pill — the "Register" chip in the announcement bar. */
  outline:
    "border border-brand-brown/70 bg-transparent text-brand-brown hover:bg-brand-brown hover:text-surface-cream",
  /** No chrome until hover — secondary actions on the confirmation screen. */
  ghost: "text-brand-brown underline underline-offset-4 hover:text-brand-brown-hover",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-10 py-3 text-lg tracking-wide",
};

function classesFor(variant: Variant, size: Size, extra?: string) {
  return [BASE, VARIANTS[variant], SIZES[size], extra].filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/* ACTION: does something on this page                                        */
/* -------------------------------------------------------------------------- */
type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button", // never accidentally submit a form
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classesFor(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* NAVIGATION: goes somewhere else                                            */
/* -------------------------------------------------------------------------- */
type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classesFor(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

/**
 * The small solid triangle after "Learn More" in the design.
 * `aria-hidden` because it is pure decoration — the word "Learn More" already
 * says everything, and a screen reader announcing "black right-pointing
 * triangle" would just be noise.
 */
export function PlayGlyph() {
  return (
    <span aria-hidden="true" className="text-[0.7em] leading-none">
      ▶
    </span>
  );
}
