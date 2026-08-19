/**
 * Prefixes a path in `public/` with the site's base path.
 *
 * WHY THIS IS NEEDED
 * Next rewrites internal <Link> hrefs to include `basePath` automatically, but
 * it does NOT do the same for a plain string `src` on <Image> once
 * `images.unoptimized` is set — the URL is passed through untouched. On a
 * GitHub project Pages site, served from /museum-website/, that means every
 * photo 404s while every link works, which is a confusing way to fail.
 *
 * Normal builds set no base path, so this returns the path unchanged.
 *
 *   <Image src={assetPath("/images/hero.jpg")} … />
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(pathFromPublicRoot: string): string {
  return `${BASE_PATH}${pathFromPublicRoot}`;
}
