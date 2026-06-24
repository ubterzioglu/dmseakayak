// One-time image importer: optimize + copy tour photos into public/.
//
// Reads docs/GORSEL/Images/<folder>/*, downsizes/compresses each image with
// sharp, writes web-safe .jpg files to public/images/tours/<folder>/<slug>.jpg,
// and emits a manifest mapping each folder to its ordered list of public paths.
// Files whose name contains "bunukullan" ("use this one") are sorted first
// (cover/featured).
//
// Usage:
//   node scripts/import-gallery-images.mjs
//
// Requires the `sharp` dev dependency. One-time tool; safe to re-run
// (overwrites outputs).

import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC_ROOT = resolve(ROOT, "docs", "GORSEL", "Images");
const DST_ROOT = resolve(ROOT, "public", "images", "tours");
const MANIFEST = resolve(__dirname, "output", "gallery-manifest.json");

const FOLDERS = ["kekova-classic", "kekova-east", "kekova-west", "trak"];
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_DIM = 2000;
const QUALITY = 82;

/** Turkish-aware slug, mirrors slugify() in src/hooks/useAdminContent.ts. */
function slugify(input) {
  const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return input
    .toLowerCase()
    .replace(/[çğıöşüİ]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

async function processFolder(folder) {
  const srcDir = resolve(SRC_ROOT, folder);
  const dstDir = resolve(DST_ROOT, folder);
  await mkdir(dstDir, { recursive: true });

  let entries;
  try {
    entries = await readdir(srcDir);
  } catch {
    console.warn(`! skip ${folder}: source folder not found`);
    return [];
  }

  const images = entries
    .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
    .sort((a, b) => {
      // "-bunukullan" first, then alphabetical.
      const ak = a.toLowerCase().includes("bunukullan") ? 0 : 1;
      const bk = b.toLowerCase().includes("bunukullan") ? 0 : 1;
      return ak - bk || a.localeCompare(b);
    });

  const used = new Set();
  const paths = [];
  for (const file of images) {
    let slug = slugify(basename(file, extname(file)));
    if (!slug) slug = "image";
    // De-dup collisions (e.g. tomb3.JPEG vs tomb3.JPG → tomb3, tomb3-2).
    let name = slug;
    let n = 2;
    while (used.has(name)) name = `${slug}-${n++}`;
    used.add(name);

    const src = resolve(srcDir, file);
    const dst = resolve(dstDir, `${name}.jpg`);
    await sharp(src)
      .rotate() // honor EXIF orientation
      .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(dst);
    const publicPath = `/images/tours/${folder}/${name}.jpg`;
    paths.push(publicPath);
    console.log(`  ${file} -> ${publicPath}`);
  }
  console.log(`✓ ${folder}: ${paths.length} images`);
  return paths;
}

async function main() {
  const manifest = {};
  for (const folder of FOLDERS) {
    console.log(`\n=== ${folder} ===`);
    manifest[folder] = await processFolder(folder);
  }
  await mkdir(dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  const total = Object.values(manifest).reduce((s, a) => s + a.length, 0);
  console.log(`\nManifest written to ${MANIFEST} (${total} images total)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
