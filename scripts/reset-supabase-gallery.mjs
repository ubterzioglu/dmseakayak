// One-time: wipe the old Supabase gallery and seed it with the new tour photos.
//
// Removes every row in gallery_images and every object under gallery/ in the
// gallery-images bucket, then uploads the optimized photos from
// public/images/tours/<slug>/ (see scripts/output/gallery-manifest.json) and
// inserts a published gallery_images row for each, ordered with covers first.
//
// Uses the SERVICE ROLE key from .env.local (RLS bypass) — server-side only.
//
// Usage:
//   node scripts/reset-supabase-gallery.mjs

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFEST = resolve(__dirname, "output", "gallery-manifest.json");
const BUCKET = "gallery-images";

function loadEnv() {
  const txt = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    env[line.slice(0, i).trim()] = v;
  }
  return env;
}

const env = loadEnv();
const URL = (env.SB_PROJECT_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const KEY = env.SB_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing SB_PROJECT_URL / SB_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const TOUR_CAPTIONS = {
  "kekova-classic": "Kekova Classic",
  "kekova-east": "Kekova East",
  "kekova-west": "Kekova West",
  trak: "TRAK Experience",
};

async function listOldObjects() {
  const r = await fetch(`${URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: { ...H, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "gallery/", limit: 1000 }),
  });
  const items = await r.json();
  return Array.isArray(items) ? items.map((o) => `gallery/${o.name}`) : [];
}

async function deleteOldObjects(paths) {
  if (!paths.length) return;
  const r = await fetch(`${URL}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: { ...H, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!r.ok) throw new Error(`storage delete ${r.status}: ${await r.text()}`);
}

async function deleteAllRows() {
  const r = await fetch(`${URL}/rest/v1/gallery_images?id=not.is.null`, {
    method: "DELETE",
    headers: { ...H, Prefer: "return=minimal" },
  });
  if (!r.ok) throw new Error(`row delete ${r.status}: ${await r.text()}`);
}

async function uploadFile(localPath, destName) {
  const bytes = readFileSync(localPath);
  const r = await fetch(`${URL}/storage/v1/object/${BUCKET}/${destName}`, {
    method: "POST",
    headers: { ...H, "Content-Type": "image/jpeg", "x-upsert": "true" },
    body: bytes,
  });
  if (!r.ok) throw new Error(`upload ${r.status}: ${await r.text()}`);
  return `${URL}/storage/v1/object/public/${BUCKET}/${destName}`;
}

async function insertRows(rows) {
  const r = await fetch(`${URL}/rest/v1/gallery_images`, {
    method: "POST",
    headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`insert ${r.status}: ${await r.text()}`);
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

  console.log("1) Deleting old storage objects…");
  const old = await listOldObjects();
  await deleteOldObjects(old);
  console.log(`   removed ${old.length} objects`);

  console.log("2) Deleting old gallery_images rows…");
  await deleteAllRows();
  console.log("   rows cleared");

  console.log("3) Uploading + inserting new photos…");
  const rows = [];
  let sort = 0;
  for (const [folder, paths] of Object.entries(manifest)) {
    const caption = TOUR_CAPTIONS[folder] ?? "Dragoman SeaKayak";
    for (const publicPath of paths) {
      const local = resolve(ROOT, "public" + publicPath);
      const dest = `gallery/${randomUUID()}.jpg`;
      const url = await uploadFile(local, dest);
      rows.push({
        image_url: url,
        caption,
        caption_en: caption,
        caption_fr: caption,
        caption_ru: caption,
        alt: caption,
        published: true,
        sort_order: sort++,
      });
      console.log(`   + ${publicPath}`);
    }
  }
  await insertRows(rows);
  console.log(`\nDone: seeded ${rows.length} gallery images.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
