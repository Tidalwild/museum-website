import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";
import { PageShell } from "@/components/layout/PageShell";
import { getTranslation } from "@/lib/i18n";

/**
 * Placeholder route. See src/components/layout/ComingSoon.tsx for why these
 * exist — replace the body with the real page when the design is ready.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslation();
  return { title: dict.placeholder.eventsTitle };
}

export default async function Page() {
  const { locale, dict } = await getTranslation();
  return (
    <PageShell locale={locale} dict={dict}>
      <ComingSoon title={dict.placeholder.eventsTitle} dict={dict} />
    </PageShell>
  );
}
