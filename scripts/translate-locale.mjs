// Translates one UI locale file into another with DeepL, preserving the nested
// key structure of src/i18n/locales/<lang>/common.json.
//
// Machine output is a starting point, not a finished translation — nav labels,
// CTAs and SEO copy still want a human pass afterwards. Brand terms are held
// out of the translation entirely (see DO_NOT_TRANSLATE in scripts/deepl.mjs).
//
// Usage:
//   node scripts/translate-locale.mjs en de              # write de/common.json
//   node scripts/translate-locale.mjs en de --dry-run    # print, write nothing
//   node scripts/translate-locale.mjs en de --keep-existing
//       ^ only fill keys that are missing or blank in the target, so a hand-
//         corrected file can be topped up after new keys are added to source.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, translateAll } from "./deepl.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Collect every string leaf as [path, value], depth-first, in file order. */
function flatten(node, path = [], acc = []) {
  if (typeof node === "string") {
    acc.push([path, node]);
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => flatten(v, [...path, i], acc));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) flatten(v, [...path, k], acc);
  }
  return acc;
}

const getAt = (node, path) =>
  path.reduce((cur, key) => (cur == null ? undefined : cur[key]), node);

/** Rebuild the source structure with translations swapped in by path. */
function rebuild(node, translations, path = []) {
  if (typeof node === "string") {
    const key = path.join(" ");
    return translations.has(key) ? translations.get(key) : node;
  }
  if (Array.isArray(node)) return node.map((v, i) => rebuild(v, translations, [...path, i]));
  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.entries(node).map(([k, v]) => [k, rebuild(v, translations, [...path, k])]),
    );
  }
  return node;
}

async function main() {
  const [from, to, ...flags] = process.argv.slice(2);
  if (!from || !to) {
    throw new Error(
      "Usage: node scripts/translate-locale.mjs <source> <target> [--dry-run] [--keep-existing]",
    );
  }
  const dryRun = flags.includes("--dry-run");
  const keepExisting = flags.includes("--keep-existing");

  const apiKey = loadEnv().DEEPL_API_KEY;
  if (!apiKey) throw new Error("DEEPL_API_KEY missing from .env.local");

  const srcPath = resolve(ROOT, "src/i18n/locales", from, "common.json");
  const outPath = resolve(ROOT, "src/i18n/locales", to, "common.json");
  const source = JSON.parse(readFileSync(srcPath, "utf8"));

  const existing =
    keepExisting && existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : null;

  let entries = flatten(source);
  if (existing) {
    const before = entries.length;
    entries = entries.filter(([path]) => {
      const current = getAt(existing, path);
      return typeof current !== "string" || current.trim() === "";
    });
    console.log(
      `--keep-existing: ${before - entries.length} keys already filled, ${entries.length} to translate`,
    );
  }

  if (entries.length === 0) {
    console.log("Nothing to translate.");
    return;
  }

  const chars = entries.reduce((n, [, v]) => n + v.length, 0);
  console.log(`${from} -> ${to}: ${entries.length} strings, ${chars} characters`);

  const out = await translateAll(
    entries.map(([, v]) => v),
    from,
    to,
    apiKey,
    (batch, size) => console.log(`  batch ${batch}: ${size} strings`),
  );
  const translations = new Map(entries.map(([path], i) => [path.join(" "), out[i]]));
  const merged = rebuild(existing ?? source, translations);

  if (dryRun) {
    for (const [path, original] of entries.slice(0, 15)) {
      console.log(
        `  ${path.join(".")}\n    ${from}: ${original}\n    ${to}: ${translations.get(path.join(" "))}`,
      );
    }
    console.log(`\n--dry-run: ${outPath} not written.`);
    return;
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
