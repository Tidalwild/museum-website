import type { Metadata } from "next";

import { BookingFlow } from "@/components/booking/BookingFlow";
import { BookingNotice } from "@/components/layout/BookingNotice";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { getTranslation } from "@/lib/i18n";

/**
 * ===========================================================================
 * BOOKING PAGE  ( /book )
 * ===========================================================================
 * Recreates the "Registration" mock-up. The page itself is a Server
 * Component — it renders the header, the brown notice strip and the footer on
 * the server and ships no JavaScript for them.
 *
 * Only <BookingFlow> is interactive, so that is the only piece marked
 * "use client".
 * ===========================================================================
 */

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslation();
  return {
    title: dict.meta.bookingTitle,
    description: dict.meta.bookingDescription,
  };
}

export default async function BookingPage() {
  const { locale, dict } = await getTranslation();

  return (
    <>
      <SkipLink label={dict.meta.skipToContent} />
      <DemoBanner dict={dict} />
      <SiteHeader locale={locale} dict={dict} />
      <BookingNotice dict={dict} />

      <main id="main-content" tabIndex={-1} className="min-h-[60vh] bg-surface-sand">
        <BookingFlow dict={dict} locale={locale} />
      </main>

      <SiteFooter dict={dict} />
    </>
  );
}
