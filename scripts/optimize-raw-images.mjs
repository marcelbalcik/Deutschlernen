// One-off: flatten public/exercises/_raw/**/<id>.png into _raw/<id>.png and
// downscale/compress each to a flashcard-appropriate size. Originals from the
// image generator are ~1 MB each (way too big for ~150px display); this brings
// them to ~512px PNGs in the tens-of-KB range.
//
// Run: node scripts/optimize-raw-images.mjs

import { readdirSync, statSync, renameSync, rmdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawDir = join(__dirname, "..", "public", "exercises", "_raw");
const MAX = 512;

function allPngs(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...allPngs(p));
    else if (entry.toLowerCase().endsWith(".png")) out.push(p);
  }
  return out;
}

const pngs = allPngs(rawDir);
let optimized = 0;
let skippedDup = 0;

for (const src of pngs) {
  const name = basename(src);
  const dest = join(rawDir, name);

  // A duplicate id already placed at the root → drop this extra copy.
  if (src !== dest && existsSync(dest)) {
    skippedDup++;
    continue;
  }

  const buf = await sharp(src)
    .resize(MAX, MAX, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 80 })
    .toBuffer();

  // Write to a temp file then move into place (works for in-place root files too).
  const tmp = dest + ".tmp";
  await sharp(buf).toFile(tmp);
  renameSync(tmp, dest);
  optimized++;
}

// Remove now-empty subdirectories.
function pruneEmptyDirs(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      pruneEmptyDirs(p);
      if (readdirSync(p).length === 0) rmdirSync(p);
    }
  }
}
pruneEmptyDirs(rawDir);

console.log(
  `[optimize-raw-images] optimized ${optimized}, skipped ${skippedDup} duplicate(s).`
);
