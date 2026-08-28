import { describe, it, expect } from "vitest";
import { parseBulkReviews } from "./parseReviews";

describe("parseBulkReviews", () => {
  it("parses the scraper JSON shape with source_lang and external_id", () => {
    const json = JSON.stringify([
      {
        author: "Sophie M.",
        rating: 5,
        body: "Une expérience magique.",
        source_label: "Google",
        source_lang: "fr",
        external_id: "abc123",
      },
    ]);
    const { rows, errors } = parseBulkReviews(json);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      author: "Sophie M.",
      rating: 5,
      source_lang: "fr",
      external_id: "abc123",
    });
  });

  it("normalizes invalid source_lang to undefined and missing external_id to null", () => {
    // "es" is deliberately a language the site does not serve — this asserted
    // on "de" until German was added, which made the fixture a valid locale.
    const json = JSON.stringify([
      { author: "A", rating: 4, body: "Nice", source_lang: "es" },
    ]);
    const { rows } = parseBulkReviews(json);
    expect(rows[0].source_lang).toBeUndefined();
    expect(rows[0].external_id).toBeNull();
  });

  it("accepts German as a source language", () => {
    const json = JSON.stringify([
      { author: "B", rating: 5, body: "Sehr schön", source_lang: "de" },
    ]);
    const { rows } = parseBulkReviews(json);
    expect(rows[0].source_lang).toBe("de");
  });

  it("accepts text/JSON without lang fields (back-compat line format)", () => {
    const { rows, errors } = parseBulkReviews("James R. | 4\nGreat day out.");
    expect(errors).toHaveLength(0);
    expect(rows[0]).toMatchObject({ author: "James R.", rating: 4, body: "Great day out." });
    expect(rows[0].source_lang).toBeUndefined();
  });

  it("clamps out-of-range ratings and skips rows missing author/body", () => {
    const json = JSON.stringify([
      { author: "Ok", rating: 99, body: "Fine" },
      { author: "", body: "no author" },
    ]);
    const { rows, errors } = parseBulkReviews(json);
    expect(rows).toHaveLength(1);
    expect(rows[0].rating).toBe(5);
    expect(errors.length).toBeGreaterThan(0);
  });
});
