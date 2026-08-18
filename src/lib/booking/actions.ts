"use server";

import { BOOKING_RULES } from "@/config/site";
import { sendBookingConfirmation } from "@/lib/email/send";
import { generateBookingReference } from "./reference";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { BookingInsert, BookingRow } from "@/lib/supabase/types";
import { validateBooking, type BookingErrors, type BookingFormValues } from "./schema";

/**
 * ===========================================================================
 * createBooking — the one server action behind the booking form
 * ===========================================================================
 * `"use server"` at the top of the file means every function exported here
 * runs ONLY on the server, even though a Client Component calls it like a
 * normal async function. Next.js handles the network request for you, so
 * there is no `/api` route to write and no `fetch()` to hand-code.
 *
 * What it does, in order:
 *   1. Re-validate everything. The browser already checked, but a browser
 *      check can be bypassed — this is the check that counts.
 *   2. Make sure the day still has room (someone may have booked while this
 *      visitor was reading the Terms and Conditions).
 *   3. Insert the booking and let Postgres mint the reference code.
 *   4. Send the confirmation email.
 *   5. Report back with either the booking reference, or field-level errors
 *      the form can attach to the right inputs.
 *
 * It always RETURNS a result and never throws, so the form can show a helpful
 * message instead of Next.js showing an error screen.
 * ===========================================================================
 */

export type CreateBookingResult =
  | {
      status: "success";
      reference: string;
      email: string;
      visitDate: string;
      guests: number;
      /** False when the booking saved but the email provider failed. */
      emailSent: boolean;
    }
  | {
      status: "invalid";
      /** Translation keys, keyed by field name — the form renders these. */
      errors: BookingErrors;
      /** Extra numbers for messages like "only 3 places left". */
      messageValues?: Record<string, string | number>;
    }
  | {
      status: "error";
      /** A translation key from `dict.booking.errors`. */
      errorKey: "unexpected" | "network";
    };

export async function createBooking(
  values: BookingFormValues & { locale?: string },
): Promise<CreateBookingResult> {
  /* ---------------------------------------------------------------------- */
  /* 1. Validate — the authoritative pass                                    */
  /* ---------------------------------------------------------------------- */
  const validation = validateBooking(values);
  if (!validation.success || !validation.data) {
    return { status: "invalid", errors: validation.errors };
  }
  const booking = validation.data;

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    /* ------------------------------------------------------------------ */
    /* DEVELOPMENT FALLBACK                                                */
    /* ------------------------------------------------------------------ */
    /* No Supabase project configured yet. Rather than a dead end, run the
       rest of the flow so you can see the confirmation screen and the
       confirmation email straight after `npm run dev`.

       This is fenced off from production on purpose: telling a real visitor
       their visit is booked when nothing was saved would be far worse than
       an error message. Delete this whole block once Supabase is set up. */
    if (process.env.NODE_ENV === "production") {
      console.error("[booking] Supabase is not configured — the booking was NOT saved.");
      return { status: "error", errorKey: "unexpected" };
    }

    const reference = generateBookingReference();
    console.warn(
      `[booking] DEVELOPMENT FALLBACK — nothing was saved.\n` +
        `          Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.\n` +
        `          Pretend-booking ${reference} for ${booking.email} on ${booking.visitDate}.`,
    );

    const devEmail = await sendBookingConfirmation({
      reference,
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      visitDate: booking.visitDate,
      guests: booking.guests,
      locale: booking.locale,
    });

    return {
      status: "success",
      reference,
      email: booking.email,
      visitDate: booking.visitDate,
      guests: booking.guests,
      emailSent: devEmail.ok,
    };
  }

  try {
    /* -------------------------------------------------------------------- */
    /* 2. Capacity check                                                     */
    /* -------------------------------------------------------------------- */
    if (BOOKING_RULES.dailyCapacity !== null) {
      const { data: alreadyBooked, error: capacityError } = await supabase.rpc(
        "booked_guests_on",
        { target_date: booking.visitDate },
      );

      if (capacityError) {
        console.error("[booking] Capacity check failed:", capacityError);
        return { status: "error", errorKey: "unexpected" };
      }

      const remaining = BOOKING_RULES.dailyCapacity - (alreadyBooked ?? 0);
      if (booking.guests > remaining) {
        return {
          status: "invalid",
          errors: { guests: "capacityFull" },
          messageValues: { remaining: Math.max(remaining, 0) },
        };
      }
    }

    /* -------------------------------------------------------------------- */
    /* 3. Insert                                                             */
    /* -------------------------------------------------------------------- */
    const insert: Omit<BookingInsert, "reference"> = {
      first_name: booking.firstName,
      last_name: booking.lastName,
      phone_country_code: booking.phoneCountryCode,
      phone: booking.phone,
      email: booking.email,
      visit_date: booking.visitDate,
      guests: booking.guests,
      referral_source: booking.referralSource,
      // We record WHEN consent was given; the tick box itself is not stored.
      accepted_terms_at: new Date().toISOString(),
      locale: booking.locale,
    };

    const { data: row, error: insertError } = await supabase
      .from("bookings")
      .insert(insert)
      .select("reference, email, visit_date, guests, first_name, last_name, locale")
      .single<Pick<
        BookingRow,
        "reference" | "email" | "visit_date" | "guests" | "first_name" | "last_name" | "locale"
      >>();

    if (insertError || !row) {
      console.error("[booking] Insert failed:", insertError);
      return { status: "error", errorKey: "unexpected" };
    }

    /* -------------------------------------------------------------------- */
    /* 4. Confirmation email                                                 */
    /* -------------------------------------------------------------------- */
    const emailResult = await sendBookingConfirmation({
      reference: row.reference,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      visitDate: row.visit_date,
      guests: row.guests,
      locale: booking.locale,
    });

    if (emailResult.ok) {
      // Stamp the row so staff can see the email really went out. If this
      // update fails it is not worth failing the booking over.
      await supabase
        .from("bookings")
        .update({ confirmation_email_sent_at: new Date().toISOString() })
        .eq("reference", row.reference);
    } else {
      console.error("[booking] Email not sent:", emailResult.error);
    }

    /* -------------------------------------------------------------------- */
    /* 5. Done                                                               */
    /* -------------------------------------------------------------------- */
    return {
      status: "success",
      reference: row.reference,
      email: row.email,
      visitDate: row.visit_date,
      guests: row.guests,
      emailSent: emailResult.ok,
    };
  } catch (error) {
    console.error("[booking] Unexpected failure:", error);
    return { status: "error", errorKey: "unexpected" };
  }
}
