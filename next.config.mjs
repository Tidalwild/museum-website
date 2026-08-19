/**
 * ---------------------------------------------------------------------------
 * TWO BUILD MODES
 * ---------------------------------------------------------------------------
 * Normal (`npm run build`)
 *   A full Next.js app with a server. The booking form saves to Supabase and
 *   sends email. This is how the real site should be deployed — Vercel, or any
 *   host that can run Node.
 *
 * Static demo (`npm run build:demo`)
 *   Exports plain HTML/CSS/JS to `out/` so it can be served by GitHub Pages,
 *   which has no server. Everything is browsable, but the booking cannot be
 *   submitted — there is nothing to receive it. Used for sharing a preview
 *   link before the real hosting is set up.
 *
 * The flag is NEXT_PUBLIC_STATIC_DEMO, read in a few places (the language
 * switcher, the booking flow) so the demo tells the visitor what it is instead
 * of quietly failing.
 * ---------------------------------------------------------------------------
 */
const isStaticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === "1";

/**
 * GitHub project Pages serve from a sub-path (/museum-website/), so every
 * asset URL needs that prefix. Change this if the repository is renamed.
 */
const GITHUB_PAGES_BASE_PATH = "/museum-website";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isStaticDemo
    ? {
        output: "export",
        basePath: GITHUB_PAGES_BASE_PATH,
        trailingSlash: true,
        // The image optimiser needs a server; serve the originals instead.
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
