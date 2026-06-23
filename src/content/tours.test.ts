import { describe, it, expect } from "vitest";
import { TOURS, MULTI_DAY_TOURS, getTour } from "./tours";
import { LOCALES } from "@/lib/site";

describe("tours data integrity", () => {
  it("has the three expected tours", () => {
    expect(TOURS.map((t) => t.slug).sort()).toEqual(["kekova-classic", "kekova-east", "kekova-west"]);
  });

  it("getTour resolves a known slug and rejects unknown", () => {
    expect(getTour("kekova-west")?.slug).toBe("kekova-west");
    expect(getTour("nope")).toBeUndefined();
  });

  it("every localized field is complete in all locales", () => {
    for (const tour of TOURS) {
      for (const loc of LOCALES) {
        expect(tour.title[loc], `${tour.slug}.title.${loc}`).toBeTruthy();
        expect(tour.tagline[loc], `${tour.slug}.tagline.${loc}`).toBeTruthy();
        expect(tour.highlights[loc].length, `${tour.slug}.highlights.${loc}`).toBeGreaterThan(0);
        expect(tour.included![loc].length, `${tour.slug}.included.${loc}`).toBeGreaterThan(0);
        expect(tour.itinerary![loc].length, `${tour.slug}.itinerary.${loc}`).toBeGreaterThan(0);
        expect(tour.whyChoose![loc].length, `${tour.slug}.whyChoose.${loc}`).toBeGreaterThan(0);
      }
    }
  });

  it("has valid prices and distances", () => {
    for (const tour of TOURS) {
      expect(tour.priceEur).toBeGreaterThan(0);
      expect(tour.distanceKm).toBeGreaterThan(0);
    }
  });
});

describe("multi-day tours data integrity", () => {
  it("getTour resolves multi-day slugs", () => {
    expect(getTour("lycian-comfort-escape")?.slug).toBe("lycian-comfort-escape");
    expect(getTour("trak-signature")?.multiDay?.status).toBe("special");
  });

  it("every multi-day tour has a multiDay block and complete core localized fields", () => {
    for (const tour of MULTI_DAY_TOURS) {
      expect(tour.multiDay, `${tour.slug}.multiDay`).toBeDefined();
      expect(tour.multiDay!.durationDays).toBeGreaterThan(0);
      for (const loc of LOCALES) {
        expect(tour.title[loc], `${tour.slug}.title.${loc}`).toBeTruthy();
        expect(tour.tagline[loc], `${tour.slug}.tagline.${loc}`).toBeTruthy();
        expect(tour.highlights[loc].length, `${tour.slug}.highlights.${loc}`).toBeGreaterThan(0);
      }
    }
  });

  it("day-by-day plans (when present) are complete in all locales", () => {
    for (const tour of MULTI_DAY_TOURS) {
      const dbd = tour.multiDay!.dayByDay;
      if (!dbd) continue;
      for (const loc of LOCALES) {
        expect(dbd[loc].length, `${tour.slug}.dayByDay.${loc}`).toBeGreaterThan(0);
        for (const d of dbd[loc]) {
          expect(d.title, `${tour.slug}.day${d.day}.title.${loc}`).toBeTruthy();
          expect(d.body, `${tour.slug}.day${d.day}.body.${loc}`).toBeTruthy();
        }
      }
    }
  });
});
