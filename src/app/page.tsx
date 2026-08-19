import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { ExploreCards } from "@/components/home/ExploreCards";
import { Hero } from "@/components/home/Hero";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { getTranslation } from "@/lib/i18n";

/**
 * ===========================================================================
 * HOME PAGE  ( / )
 * ===========================================================================
 * Recreates the "Home Page" mock-up, top to bottom:
 *
 *   SiteHeader        dark green bar, wordmark, nav, 中 | Eng
 *   AnnouncementBar   "→ Book Your Visit Now (Register) ←"
 *   Hero              the entrance photograph
 *   WelcomeSection    heading, paragraph, "Learn More ▶"
 *   ExploreCards      Collection · Events · Materials
 *   SiteFooter        hours, contact, copyright
 *
 * This is a Server Component. It fetches the dictionary on the server and
 * ships zero JavaScript for everything except the language switcher, which
 * keeps the page fast on a phone.
 * ===========================================================================
 */
export default async function HomePage() {
  const { locale, dict } = await getTranslation();

  return (
    <>
      <SkipLink label={dict.meta.skipToContent} />
      <DemoBanner dict={dict} />
      <SiteHeader locale={locale} dict={dict} currentPath="/" />
      <AnnouncementBar dict={dict} />

      {/* `tabIndex={-1}` lets the skip link move focus here without turning
          <main> into a normal tab stop. */}
      <main id="main-content" tabIndex={-1} className="bg-surface-cream">
        <Hero dict={dict} />
        <WelcomeSection dict={dict} />

        {/* The thin rule under "Learn More" in the design. Decorative. */}
        <div className="page-shell">
          <hr className="border-line-soft" />
        </div>

        <ExploreCards dict={dict} />
      </main>

      <SiteFooter dict={dict} />
    </>
  );
}
