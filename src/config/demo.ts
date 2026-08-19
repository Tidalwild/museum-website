/**
 * Is this build the static GitHub Pages preview?
 *
 * Set by `npm run build:demo`. A static export has no server, so the booking
 * cannot be submitted and the language switcher cannot save a choice. Rather
 * than let those fail silently, the few affected components check this flag and
 * say what is going on.
 *
 * Always `false` in a normal build, so nothing here affects the real site.
 */
export const IS_STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === "1";
