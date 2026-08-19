/**
 * Inert stand-in for `src/lib/i18n/actions.ts` during the static demo build.
 * The demo hides the language switcher, so this is never called.
 */
import type { Locale } from "@/lib/i18n/config";

export async function setLocale(_locale: Locale): Promise<void> {}
