/**
 * Inert stand-in for `src/lib/booking/actions.ts` during the static demo build.
 * See `scripts/build-static-demo.mjs` for why the swap is necessary.
 *
 * Never reached: BookingFlow checks IS_STATIC_DEMO before calling this.
 */
import type { BookingErrors, BookingFormValues } from "@/lib/booking/schema";

export type CreateBookingResult =
  | {
      status: "success";
      reference: string;
      email: string;
      visitDate: string;
      guests: number;
      emailSent: boolean;
    }
  | { status: "invalid"; errors: BookingErrors; messageValues?: Record<string, string | number> }
  | { status: "error"; errorKey: "unexpected" | "network" };

export async function createBooking(
  _values: BookingFormValues & { locale?: string },
): Promise<CreateBookingResult> {
  return { status: "error", errorKey: "unexpected" };
}
