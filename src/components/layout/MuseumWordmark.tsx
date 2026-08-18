/**
 * The museum's wordmark: 樹仁大學校史館 over the English name in small capitals.
 *
 * Replace the two <span>s with an <Image> once you have the real logo file —
 * keep the `alt` text equal to the museum's full name if you do.
 */
export function MuseumWordmark({
  chinese,
  english,
  size = "md",
}: {
  chinese: string;
  english: string;
  size?: "sm" | "md";
}) {
  const chineseSize = size === "sm" ? "text-xl sm:text-2xl" : "text-2xl sm:text-[28px]";
  const englishSize = size === "sm" ? "text-[8px]" : "text-[9px] sm:text-[10px]";

  return (
    <span className="block leading-tight">
      <span className={`block font-serif tracking-[0.12em] text-white ${chineseSize}`}>
        {chinese}
      </span>
      <span
        className={`mt-1 block font-serif uppercase tracking-[0.18em] text-white/80 ${englishSize}`}
      >
        {english}
      </span>
    </span>
  );
}
