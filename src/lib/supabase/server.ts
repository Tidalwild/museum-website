import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ===========================================================================
 * SUPABASE — SERVER-SIDE CLIENT
 * ===========================================================================
 * This client uses the SERVICE ROLE key, which bypasses Row Level Security.
 * That is exactly why the file starts with `import "server-only"` — if anyone
 * ever imports it from a Client Component by mistake, the build FAILS instead
 * of shipping your secret key to the browser.
 *
 * ⚠️  NEVER prefix the service role key with NEXT_PUBLIC_.
 *     Anything named NEXT_PUBLIC_* is embedded in the JavaScript bundle.
 *
 * Environment variables required (put them in `.env.local`):
 *   NEXT_PUBLIC_SUPABASE_URL   — e.g. https://abcdefgh.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  — Project Settings → API → service_role
 * ===========================================================================
 */

let cachedClient: SupabaseClient | null = null;

/**
 * Returns the shared Supabase client, or `null` when the environment variables
 * are missing.
 *
 * Returning `null` rather than throwing means you can clone this repository
 * and run `npm run dev` with no Supabase project at all — the booking form
 * still works end to end and simply reports a friendly error on submit.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.warn(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. " +
        "Bookings cannot be saved until you add them to .env.local.",
    );
    return null;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      // There is no logged-in user here — this is a trusted server process.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
