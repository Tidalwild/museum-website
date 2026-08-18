/**
 * WCAG 2.2 — 2.4.1 Bypass Blocks.
 *
 * The first thing a keyboard user reaches on every page. It is invisible until
 * focused, then jumps straight past the header and navigation to the main
 * content, so nobody has to tab through the menu on every single page.
 */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-navy focus:px-5 focus:py-3 focus:font-serif focus:text-white focus:shadow-raised"
    >
      {label}
    </a>
  );
}
