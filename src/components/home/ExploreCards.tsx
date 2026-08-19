import Image from "next/image";
import Link from "next/link";

import { HOME_CARDS } from "@/config/site";
import { assetPath } from "@/lib/asset-path";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * The three image cards at the foot of the home page: Collection, Events,
 * Materials.
 *
 * Each whole card is one LINK. Wrapping the image AND the caption in a single
 * <a> means:
 *   • there is only one tab stop per card, not two; and
 *   • screen readers announce one link named "Collection", not a mystery
 *     image link followed by an identical text link.
 *
 * Because the caption already names the destination, each image gets `alt=""`
 * — repeating the word would make the link read "Collection Collection".
 * The `sr-only` description is there for anyone who wants the detail.
 */
export function ExploreCards({ dict }: { dict: Dictionary }) {
  return (
    <section aria-labelledby="explore-heading" className="bg-surface-parchment/70">
      <div className="page-shell py-12 sm:py-16">
        {/* A heading is required for the landmark to be nameable, but the
            design does not show one — so it is visually hidden. */}
        <h2 id="explore-heading" className="sr-only">
          {dict.home.exploreHeading}
        </h2>

        <ul className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {HOME_CARDS.map((card) => (
            <li key={card.key}>
              <Link
                href={card.href}
                className="group block rounded-sm transition-transform motion-safe:hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-line-soft">
                  <Image
                    src={assetPath(card.image)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className="object-cover"
                  />
                </div>
                <span className="mt-3 block font-serif text-lg text-ink group-hover:underline group-hover:underline-offset-4">
                  {dict.home.cards[card.key]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
