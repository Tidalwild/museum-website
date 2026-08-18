import type { Metadata, Viewport } from "next";

import { SITE } from "@/config/site";
import { HTML_LANG } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n";
import "./globals.css";

/**
 * ===========================================================================
 * ROOT LAYOUT — wraps every page on the site
 * ===========================================================================
 * Its one important job is putting the right `lang` on <html>. Screen readers
 * use that attribute to choose a pronunciation, so a Chinese page marked
 * `lang="en"` is read out in an English accent — WCAG 3.1.1 Language of Page.
 * ===========================================================================
 */

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslation();
  return {
    title: {
      default: dict.meta.homeTitle,
      template: `%s · ${SITE.shortName}`,
    },
    description: dict.meta.homeDescription,
    metadataBase: new URL(SITE.url),
  };
}

export const viewport: Viewport = {
  themeColor: "#0A5449",
  // Do NOT add `maximumScale` or `userScalable: false` here — blocking pinch
  // zoom fails WCAG 1.4.4 Resize Text.
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getTranslation();

  return (
    <html lang={HTML_LANG[locale]}>
      {/* `id="top"` is the target of the footer's "Return to the top" link. */}
      <body id="top">{children}</body>
    </html>
  );
}
