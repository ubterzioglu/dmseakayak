// One-time sync: pushes bundled static tour content (src/content/tours.ts,
// src/content/multiDayTours.ts) into public.tours DB rows, but ONLY for rows
// whose hero_image still points at the bundled /images/tours/... path (i.e.
// nobody has edited that tour via the admin panel yet). Rows with a
// Supabase Storage hero_image (admin-uploaded) are left untouched.
//
// Usage: npx tsx --tsconfig tsconfig.app.json scripts/sync-static-tours.mjs [--dry-run]

import { createClient } from "@supabase/supabase-js";
import { TOURS } from "../src/content/tours.ts";
import { MULTI_DAY_TOURS } from "../src/content/multiDayTours.ts";
import { tourToInput } from "../src/hooks/useTours.ts";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SB_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SB_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const { data: rows, error } = await supabase
    .from("tours")
    .select("id, slug, sort_order, hero_image, published");
  if (error) throw new Error(error.message);

  const byslug = new Map(rows.map((r) => [r.slug, r]));
  const staticTours = [
    ...TOURS.map((t, i) => ({ tour: t, sortOrder: i })),
    ...MULTI_DAY_TOURS.map((t, i) => ({ tour: t, sortOrder: i })),
  ];

  let updated = 0;
  let skippedEdited = 0;
  let skippedMissing = 0;

  for (const { tour, sortOrder } of staticTours) {
    const row = byslug.get(tour.slug);
    if (!row) {
      console.log(`- ${tour.slug}: not in DB, skipping (would need insert)`);
      skippedMissing++;
      continue;
    }
    const isStillStatic = !row.hero_image || row.hero_image.startsWith("/images/tours/");
    if (!isStillStatic) {
      console.log(`- ${tour.slug}: hero_image already admin-managed (${row.hero_image}), skipping`);
      skippedEdited++;
      continue;
    }

    const input = tourToInput(tour, { published: row.published, sortOrder: row.sort_order ?? sortOrder });
    console.log(`✓ ${tour.slug}: syncing static content -> DB (hero_image: ${input.hero_image})`);
    if (!DRY_RUN) {
      const { error: updErr } = await supabase.from("tours").update(input).eq("id", row.id);
      if (updErr) throw new Error(`${tour.slug}: ${updErr.message}`);
    }
    updated++;
  }

  console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Done. Updated: ${updated}, skipped (admin-edited): ${skippedEdited}, skipped (missing): ${skippedMissing}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
