/**
 * ===========================================================================
 * BUILD THE STATIC DEMO   —   npm run build:demo
 * ===========================================================================
 * Produces `out/`: plain HTML, CSS and JS that any dumb file host can serve,
 * GitHub Pages included. Used for a shareable preview link before the real
 * hosting exists.
 *
 * WHY THIS SCRIPT EXISTS INSTEAD OF JUST `next build`
 * Next refuses to produce a static export that contains a Server Action, and
 * it counts one that is merely *imported* — a branch that never runs is still
 * a build failure. A webpack `resolve.alias` does not reliably intercept it
 * either, because the App Router compiles the server layer separately.
 *
 * So the two "use server" modules are physically swapped for inert stubs for
 * the duration of the build, then put back. The `finally` block restores them
 * even if the build throws, and the originals are only ever read from memory —
 * nothing is deleted.
 *
 * WHAT THE DEMO CANNOT DO
 *   • take a booking     — there is no server to receive it
 *   • switch language    — no server to remember the choice; switcher hidden
 * Both are explained to the visitor by the banner and the submit message,
 * rather than failing silently. See `src/config/demo.ts`.
 * ===========================================================================
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/** Must match `basePath` in next.config.mjs. */
const BASE_PATH = "/museum-website";

const SWAPS = [
  { real: "src/lib/booking/actions.ts", stub: "scripts/demo-stubs/booking-actions.ts" },
  { real: "src/lib/i18n/actions.ts", stub: "scripts/demo-stubs/i18n-actions.ts" },
];

const originals = SWAPS.map(({ real }) => ({ path: real, content: readFileSync(real, "utf8") }));

try {
  for (const { real, stub } of SWAPS) {
    writeFileSync(real, readFileSync(stub, "utf8"));
    console.log(`  swapped in stub for ${real}`);
  }

  execSync("next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_STATIC_DEMO: "1",
      // Read by src/lib/asset-path.ts — next/image does not apply basePath to
      // a plain string src once images.unoptimized is set.
      NEXT_PUBLIC_BASE_PATH: BASE_PATH,
    },
  });

  // GitHub Pages runs Jekyll by default, which ignores directories beginning
  // with an underscore — that would silently drop Next's `_next/` bundle.
  writeFileSync("out/.nojekyll", "");
  console.log("\n  wrote out/.nojekyll");
} finally {
  for (const { path, content } of originals) {
    writeFileSync(path, content);
    console.log(`  restored ${path}`);
  }
}
