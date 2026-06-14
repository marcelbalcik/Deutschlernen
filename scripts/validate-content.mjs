// Data-integrity check for the phrase pack + images. Run:
//   node scripts/validate-content.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pack = JSON.parse(
  readFileSync(join(root, "src/data/phrase_packs.json"), "utf8")
);
const rawDir = join(root, "public/exercises/_raw");
const rawFiles = new Set(
  readdirSync(rawDir).filter((f) => f.endsWith(".png"))
);

let errors = 0;
let warnings = 0;
const seenIds = new Set();
const usedImages = new Set();
const perCat = {};
const langs = ["en", "de", "tr"];

for (const p of pack.packs) {
  perCat[p.id] = p.phrases.length;
  for (const ph of p.phrases) {
    if (seenIds.has(ph.id)) {
      console.log(`ERROR duplicate id: ${ph.id}`);
      errors++;
    }
    seenIds.add(ph.id);

    for (const l of langs) {
      if (!ph.text?.[l] || !ph.text[l].trim()) {
        console.log(`ERROR ${ph.id} missing ${l} text`);
        errors++;
      }
    }
    if (!ph.scene || !ph.scene.trim()) {
      console.log(`WARN ${ph.id} missing scene`);
      warnings++;
    }

    const img = `${ph.id}.png`;
    if (!rawFiles.has(img)) {
      console.log(`ERROR ${ph.id} has NO image (${img})`);
      errors++;
    } else {
      usedImages.add(img);
    }

    // id prefix should match its pack id
    if (!ph.id.startsWith(p.id)) {
      console.log(`WARN ${ph.id} id prefix != pack ${p.id}`);
      warnings++;
    }
  }
}

// Images with no matching phrase
for (const f of rawFiles) {
  if (!usedImages.has(f)) {
    console.log(`WARN orphan image (no phrase): ${f}`);
    warnings++;
  }
}

console.log("\n--- summary ---");
console.log("packs/phrases:", perCat, "total:", seenIds.size);
console.log("images on disk:", rawFiles.size, "| used:", usedImages.size);
console.log(`errors: ${errors}, warnings: ${warnings}`);
process.exit(errors > 0 ? 1 : 0);
