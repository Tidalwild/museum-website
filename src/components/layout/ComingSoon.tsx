import { ButtonLink } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * A tidy placeholder for the pages that are not designed yet (About, Visit,
 * Collection, Events, Materials).
 *
 * They exist as real routes rather than dead links because every link in the
 * mock-ups has to go SOMEWHERE — a 404 is a worse experience than an honest
 * "coming soon", and it means keyboard and screen-reader testing can cover the
 * whole navigation today.
 *
 * Delete this component once the real pages are written.
 */
export function ComingSoon({
  title,
  body,
  dict,
}: {
  title: string;
  body?: string;
  dict: Dictionary;
}) {
  return (
    <div className="page-shell py-20 text-center sm:py-28">
      <h1 className="font-serif text-3xl font-bold text-brand-brown sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-5 max-w-xl font-serif text-[15px] leading-relaxed text-ink">
        {body ?? dict.placeholder.comingSoonBody}
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/book">{dict.placeholder.bookVisit}</ButtonLink>
        <ButtonLink href="/" variant="ghost">
          {dict.placeholder.backHome}
        </ButtonLink>
      </div>
    </div>
  );
}
