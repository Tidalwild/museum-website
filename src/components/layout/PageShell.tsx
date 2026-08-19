import type { ReactNode } from "react";

import { DemoBanner } from "./DemoBanner";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SkipLink } from "./SkipLink";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * Header + main + footer, with the skip link and the `id="main-content"`
 * target already wired up. Use it for every simple page so no route can
 * accidentally ship without a skip link or a <main> landmark.
 *
 * The home page and the booking page build their own shell instead, because
 * they each insert an extra bar between the header and the content.
 */
export function PageShell({
  locale,
  dict,
  currentPath,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  currentPath?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SkipLink label={dict.meta.skipToContent} />
      <DemoBanner dict={dict} />
      <SiteHeader locale={locale} dict={dict} currentPath={currentPath} />
      <main id="main-content" tabIndex={-1} className="min-h-[55vh] bg-surface-cream">
        {children}
      </main>
      <SiteFooter dict={dict} />
    </>
  );
}
