// One-time: re-encode every Supabase-hosted site image as WebP and repoint the DB.
//
// The tour/gallery photos were uploaded as raw camera JPEGs (up to 10 MB each),
// which makes a single tour page ~19 MB of Supabase egress. On the Free plan
// that budget is 5 GB/month, so this downsizes each referenced object to a
// web-sized WebP, uploads it alongside the original, and rewrites the URLs in
// tours.hero_image, tours.gallery and gallery_images.image_url.
//
// Originals are NOT deleted: the run writes a manifest so the change can be
// rolled back, and `--delete-originals` reclaims the old objects once the site
// has been eyeballed.
//
// Uses the SERVICE ROLE key from .env.local (RLS bypass) — server-side only.
//
// Usage:
//   node scripts/optimize-supabase-images.mjs              # dry run (default)
//   node scripts/optimize-supabase-images.mjs --apply      # convert + rewrite
//   node scripts/optimize-supabase-images.mjs --rollback   # restore old URLs
//   node scripts/optimize-supabase-images.mjs --delete-originals

import { readFileSync } from "node:fs";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFEST = resolve(__dirname, "output", "image-optimization-manifest.json");
const BACKUP_DIR = process.env.IMAGE_BACKUP_DIR || resolve(ROOT, "..", "dmsk-image-backup");

const MAX_DIM = 1600;
const QUALITY = 80;
/** Keep the original if the re-encode barely moves the needle. */
const MIN_SAVING = 0.95;

const MODE = process.argv.includes("--rollback")
  ? "rollback"
  : process.argv.includes("--delete-originals")
    ? "delete"
    : process.argv.includes("--apply")
      ? "apply"
      : "dry-run";

/** Mirrors loadEnv() in reset-supabase-gallery.mjs. */
function loadEnv() {
  const txt = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const URL_BASE = (env.SB_PROJECT_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const KEY = env.SB_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) {
  console.error("Missing SB_PROJECT_URL / SB_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const PUBLIC_PREFIX = `${URL_BASE}/storage/v1/object/public/`;

const fmt = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;

/** Splits a public storage URL into its bucket and object path. */
function parsePublicUrl(url) {
  if (typeof url !== "string" || !url.startsWith(PUBLIC_PREFIX)) return null;
  const rest = url.slice(PUBLIC_PREFIX.length);
  const slash = rest.indexOf("/");
  if (slash < 0) return null;
  return { bucket: rest.slice(0, slash), path: rest.slice(slash + 1), url };
}

const webpPathFor = (path) => `${path.slice(0, path.length - extname(path).length)}.webp`;
const webpUrlFor = (ref) => `${PUBLIC_PREFIX}${ref.bucket}/${webpPathFor(ref.path)}`;

async function rest(path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { ...H, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`REST ${path} -> ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/** Every DB cell that points at our storage, as {table, id, column, urls}. */
async function collectReferences() {
  const refs = [];
  const tours = await rest("tours?select=id,slug,hero_image,gallery");
  for (const t of tours) {
    if (parsePublicUrl(t.hero_image)) {
      refs.push({ table: "tours", id: t.id, column: "hero_image", urls: [t.hero_image] });
    }
    const gal = Array.isArray(t.gallery) ? t.gallery : [];
    if (gal.some((u) => parsePublicUrl(u))) {
      refs.push({ table: "tours", id: t.id, column: "gallery", urls: gal });
    }
  }
  const gallery = await rest("gallery_images?select=id,image_url");
  for (const g of gallery) {
    if (parsePublicUrl(g.image_url)) {
      refs.push({ table: "gallery_images", id: g.id, column: "image_url", urls: [g.image_url] });
    }
  }
  return refs;
}

async function convertOne(ref) {
  const res = await fetch(ref.url);
  if (!res.ok) throw new Error(`download ${ref.path} -> ${res.status}`);
  const original = Buffer.from(await res.arrayBuffer());

  const webp = await sharp(original)
    .rotate() // honour EXIF orientation before the re-encode drops metadata
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  return { original, webp };
}

async function uploadWebp(ref, buf) {
  const target = webpPathFor(ref.path);
  const res = await fetch(`${URL_BASE}/storage/v1/object/${ref.bucket}/${target}`, {
    method: "POST",
    headers: { ...H, "Content-Type": "image/webp", "x-upsert": "true", "cache-control": "31536000" },
    body: buf,
  });
  if (!res.ok) throw new Error(`upload ${target} -> ${res.status} ${await res.text()}`);
}

/** Converts (and, with --apply, uploads) every referenced object. */
async function convertAll() {
  const refs = await collectReferences();
  const unique = new Map();
  for (const r of refs) {
    for (const u of r.urls) {
      const p = parsePublicUrl(u);
      if (p && !unique.has(u)) unique.set(u, p);
    }
  }
  console.log(`${refs.length} DB alanı, ${unique.size} benzersiz görsel.\n`);

  if (MODE === "apply") await mkdir(BACKUP_DIR, { recursive: true });
  const mapping = {};
  let before = 0;
  let after = 0;
  let skipped = 0;

  for (const [url, ref] of unique) {
    const { original, webp } = await convertOne(ref);
    before += original.length;

    if (webp.length > original.length * MIN_SAVING) {
      after += original.length;
      skipped++;
      console.log(`= ${ref.path} ${fmt(original.length)} (zaten verimli, atlandı)`);
      continue;
    }
    after += webp.length;
    // A source that was already .webp is re-encoded in place: same path, so
    // there is no URL to rewrite and no original left to delete afterwards.
    const target = webpUrlFor(ref);
    if (target !== url) mapping[url] = target;

    if (MODE === "apply") {
      const backup = resolve(BACKUP_DIR, ref.bucket, ref.path);
      await mkdir(dirname(backup), { recursive: true });
      await writeFile(backup, original);
      await uploadWebp(ref, webp);
    }
    const pct = (100 - (webp.length / original.length) * 100).toFixed(0);
    console.log(`✓ ${ref.path} ${fmt(original.length)} -> ${fmt(webp.length)} (-%${pct})`);
  }

  console.log(
    `\nToplam: ${fmt(before)} -> ${fmt(after)} ` +
      `(-%${(100 - (after / before) * 100).toFixed(0)}), ${skipped} atlandı.`
  );
  return { refs, mapping };
}

/** Rewrites every collected reference through `mapping` (old URL -> new URL). */
async function rewriteRefs(refs, mapping) {
  let changed = 0;
  for (const r of refs) {
    const next = r.urls.map((u) => mapping[u] ?? u);
    if (next.every((u, i) => u === r.urls[i])) continue;
    const value = r.column === "gallery" ? next : next[0];
    await rest(`${r.table}?id=eq.${r.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ [r.column]: value }),
    });
    changed++;
  }
  console.log(`${changed} satır güncellendi.`);
}

async function rollback() {
  const m = JSON.parse(await readFile(MANIFEST, "utf8"));
  const inverse = Object.fromEntries(Object.entries(m.mapping).map(([a, b]) => [b, a]));
  await rewriteRefs(await collectReferences(), inverse);
  console.log("Eski URL'lere geri dönüldü. WebP nesneleri duruyor.");
}

async function deleteOriginals() {
  const m = JSON.parse(await readFile(MANIFEST, "utf8"));
  const byBucket = {};
  for (const [url, replacement] of Object.entries(m.mapping)) {
    // Never delete a path we re-encoded in place — that object is live.
    if (url === replacement) continue;
    const o = parsePublicUrl(url);
    if (o) (byBucket[o.bucket] ||= []).push(o.path);
  }
  for (const [bucket, paths] of Object.entries(byBucket)) {
    const res = await fetch(`${URL_BASE}/storage/v1/object/${bucket}`, {
      method: "DELETE",
      headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: paths }),
    });
    if (!res.ok) throw new Error(`delete ${bucket} -> ${res.status} ${await res.text()}`);
    console.log(`${bucket}: ${paths.length} orijinal silindi.`);
  }
}

async function main() {
  if (MODE === "rollback") return rollback();
  if (MODE === "delete") return deleteOriginals();

  const { refs, mapping } = await convertAll();

  if (MODE !== "apply") {
    console.log("\n[DRY RUN] Hiçbir şey yazılmadı. Uygulamak için: --apply");
    return;
  }

  await rewriteRefs(refs, mapping);
  await mkdir(dirname(MANIFEST), { recursive: true });
  await writeFile(
    MANIFEST,
    JSON.stringify({ generatedAt: new Date().toISOString(), mapping }, null, 2) + "\n"
  );
  console.log(`\nManifest: ${MANIFEST}`);
  console.log(`Orijinal yedekleri: ${BACKUP_DIR}`);
  console.log("Site doğrulandıktan sonra: node scripts/optimize-supabase-images.mjs --delete-originals");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
