import { describe, expect, it } from "vitest";
import { buildReservationAlertEmail, type ReservationAlertRow } from "./email";

const baseRow: ReservationAlertRow = {
  id: "00000000-0000-4000-8000-000000000001",
  created_at: "2026-08-11T09:30:00.000Z",
  tour_slug: "kekova-classic",
  date: "2026-09-15",
  party_size: 4,
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+905551234567",
  message: "Vegetarian lunch please.",
  lang: "en",
};

describe("buildReservationAlertEmail", () => {
  it("builds a reservation alert subject and HTML body", () => {
    const email = buildReservationAlertEmail(baseRow);

    expect(email.subject).toBe("Yeni rezervasyon talebi: Ada Lovelace");
    expect(email.html).toContain("kekova-classic");
    expect(email.html).toContain("+905551234567");
    expect(email.html).toContain("Vegetarian lunch please.");
  });

  it("escapes customer-provided HTML in the body", () => {
    const email = buildReservationAlertEmail({
      ...baseRow,
      name: "<script>alert(1)</script>",
      message: "Hello <b>team</b> & thanks",
    });

    expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(email.html).toContain("Hello &lt;b&gt;team&lt;/b&gt; &amp; thanks");
    expect(email.html).not.toContain("<script>");
  });
});
