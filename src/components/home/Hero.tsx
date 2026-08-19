import Image from "next/image";

import { assetPath } from "@/lib/asset-path";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * The full-width entrance photograph at the top of the home page.
 *
 * SWAPPING THE IMAGE: drop your photo into `public/images/` and change `src`
 * below. Keep a wide aspect ratio (roughly 21:10) so the crop matches the
 * design.
 *
 * The `alt` text describes what the photo SHOWS, because the image carries
 * meaning here — it is the visitor's first look inside the museum. (If you
 * ever replace it with a purely decorative background, set `alt=""` instead so
 * screen readers skip it.)
 */
export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <div className="page-shell pt-4 sm:pt-6">
      <div className="relative aspect-[21/10] w-full overflow-hidden bg-brand-green">
        <Image
          src={assetPath("/images/hero-museum.jpg")}
          alt={dict.home.heroImageAlt}
          fill
          priority
          sizes="(max-width: 1180px) 100vw, 1180px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
