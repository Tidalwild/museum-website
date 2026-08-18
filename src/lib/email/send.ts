import "server-only";

import { SITE } from "@/config/site";
import {
  buildConfirmationEmail,
  type ConfirmationEmailData,
} from "./templates/booking-confirmation";

/**
 * ===========================================================================
 * SENDING THE CONFIRMATION EMAIL
 * ===========================================================================
 * There are three ways to send, chosen by the EMAIL_TRANSPORT variable.
 * Start at the top and move down as the project grows:
 *
 *   "console"        (default when nothing is configured)
 *                    Prints the email to your terminal. Perfect while you are
 *                    still building — no account, no API key, no cost.
 *
 *   "resend"         Calls the Resend API straight from this Next.js server.
 *                    The simplest real option. Needs RESEND_API_KEY.
 *
 *   "edge-function"  Calls the Supabase Edge Function in
 *                    `supabase/functions/send-booking-confirmation/`.
 *                    Use this when you want email handling to live with the
 *                    rest of your Supabase backend rather than in Next.js.
 *
 * Whatever you choose, sending NEVER throws. A booking that is safely in the
 * database must not be reported as a failure just because an email provider
 * had a bad minute — so this returns a result object and the page tells the
 * visitor their booking is saved but the email is delayed.
 * ===========================================================================
 */

export type SendResult =
  | { ok: true; transport: string }
  | { ok: false; transport: string; error: string };

type Transport = "console" | "resend" | "edge-function";

/** Works out which transport to use from the environment. */
function resolveTransport(): Transport {
  const explicit = process.env.EMAIL_TRANSPORT as Transport | undefined;
  if (explicit === "resend" || explicit === "edge-function" || explicit === "console") {
    return explicit;
  }
  // No explicit choice: use Resend if a key exists, otherwise print to console.
  return process.env.RESEND_API_KEY ? "resend" : "console";
}

export async function sendBookingConfirmation(
  data: ConfirmationEmailData,
): Promise<SendResult> {
  const transport = resolveTransport();
  const { subject, html, text } = buildConfirmationEmail(data);
  const from = process.env.EMAIL_FROM ?? `${SITE.shortName} <onboarding@resend.dev>`;

  try {
    switch (transport) {
      /* ------------------------------------------------------------------ */
      case "console": {
        console.info(
          [
            "",
            "──────────── CONFIRMATION EMAIL (not actually sent) ────────────",
            `To:      ${data.email}`,
            `From:    ${from}`,
            `Subject: ${subject}`,
            "",
            text,
            "────────────────────────────────────────────────────────────────",
            "Set RESEND_API_KEY in .env.local to send this for real.",
            "",
          ].join("\n"),
        );
        return { ok: true, transport };
      }

      /* ------------------------------------------------------------------ */
      case "resend": {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) return { ok: false, transport, error: "RESEND_API_KEY is not set" };

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from, to: [data.email], subject, html, text }),
        });

        if (!response.ok) {
          return { ok: false, transport, error: `Resend responded ${response.status}: ${await response.text()}` };
        }
        return { ok: true, transport };
      }

      /* ------------------------------------------------------------------ */
      case "edge-function": {
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!baseUrl || !serviceKey) {
          return { ok: false, transport, error: "Supabase URL or service role key is not set" };
        }

        const response = await fetch(`${baseUrl}/functions/v1/send-booking-confirmation`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          return { ok: false, transport, error: `Edge Function responded ${response.status}: ${await response.text()}` };
        }
        return { ok: true, transport };
      }
    }
  } catch (error) {
    // Network blip, DNS failure, provider outage — log it, do not crash.
    console.error("[email] Failed to send confirmation:", error);
    return {
      ok: false,
      transport,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
