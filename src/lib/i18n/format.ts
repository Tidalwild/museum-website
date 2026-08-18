/**
 * Tiny helpers shared by server AND client code, so this file must NOT import
 * anything server-only.
 */

/**
 * Fills `{placeholders}` in a translated string.
 *
 *   interpolate("Step {current} of {total}", { current: 1, total: 3 })
 *   // -> "Step 1 of 3"
 *
 * Keeping the placeholders inside the sentence (rather than gluing strings
 * together in code) means translators can reorder them freely — essential for
 * Chinese, where the word order often differs.
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
