import { supabase } from "@/lib/supabase";
import type { ReservationInput } from "@/components/reservation/schema";

export interface ReservationRow extends ReservationInput {
  id: string;
  created_at: string;
  status: string;
}

/**
 * Inserts a reservation request. Returns { ok } — never throws, so the caller
 * decides how to surface a failure. An insert also fires the DB trigger that
 * emails the internal alert, so ok:false means the request reached nobody and
 * the UI must say so rather than thanking the visitor.
 */
export async function submitReservation(
  input: ReservationInput,
  lang: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (!supabase) return { ok: false, reason: "no-supabase" };
  try {
    const { error } = await supabase.from("reservation_requests").insert({
      tour_slug: input.tourSlug || null,
      date: input.date || null,
      party_size: input.partySize ?? null,
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      message: input.message || null,
      lang,
    });
    if (error) {
      console.error("Reservation insert failed:", error.message);
      return { ok: false, reason: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("Reservation insert threw:", e);
    return { ok: false, reason: "exception" };
  }
}
