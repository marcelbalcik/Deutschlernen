// Scans public/exercises/<id>/ for image.png and audio.mp3 and writes a small
// manifest to src/data/assets.generated.json. The app reads this manifest to
// decide — synchronously, inside the tap handler — whether to use a real
// file or fall back to the emoji / German speech synthesis.
//
// Runs automatically before `npm run dev` and `npm run build`. You can also run
// it any time with:  npm run assets
//
// Workflow: drop image.png + audio.mp3 into public/exercises/<phrase_id>/,
// then this picks them up. No code or data edits needed.

import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const exercisesDir = join(root, "public", "exercises");
const outFile = join(root, "src", "data", "assets.generated.json");

const IMAGE_FILE = "image.png";
const AUDIO_FILE = "audio.mp3"; // German
const AUDIO_EN_FILE = "audio.en.mp3"; // English translation (optional)
const AUDIO_TR_FILE = "audio.tr.mp3"; // Turkish translation (optional)

const manifest = {};

if (existsSync(exercisesDir)) {
  for (const entry of readdirSync(exercisesDir)) {
    const dir = join(exercisesDir, entry);
    if (!statSync(dir).isDirectory()) continue;

    const flags = {};
    if (existsSync(join(dir, IMAGE_FILE))) flags.image = true;
    if (existsSync(join(dir, AUDIO_FILE))) flags.audio = true;
    if (existsSync(join(dir, AUDIO_EN_FILE))) flags.audio_en = true;
    if (existsSync(join(dir, AUDIO_TR_FILE))) flags.audio_tr = true;
    if (Object.keys(flags).length > 0) manifest[entry] = flags;
  }
}

writeFileSync(outFile, JSON.stringify(manifest, null, 2) + "\n");

// Also record which flat _raw/<id>.png images exist, so the app only points a
// phrase at an image when the file is actually there (otherwise it shows the
// emoji fallback — used by newly added phrases that don't have art yet).
const rawDir = join(root, "public", "exercises", "_raw");
const rawImages = existsSync(rawDir)
  ? readdirSync(rawDir)
      .filter((f) => f.toLowerCase().endsWith(".png"))
      .map((f) => f.replace(/\.png$/i, ""))
      .sort()
  : [];
writeFileSync(
  join(root, "src", "data", "rawImages.generated.json"),
  JSON.stringify(rawImages, null, 0) + "\n"
);

const ids = Object.keys(manifest);

// Story narration images live in public/stories/_raw/<storyId>_n<k>.png.
const storyDir = join(root, "public", "stories", "_raw");
const storyImages = existsSync(storyDir)
  ? readdirSync(storyDir)
      .filter((f) => f.toLowerCase().endsWith(".png"))
      .map((f) => f.replace(/\.png$/i, ""))
      .sort()
  : [];
writeFileSync(
  join(root, "src", "data", "storyImages.generated.json"),
  JSON.stringify(storyImages, null, 0) + "\n"
);

console.log(
  `[scan-assets] ${ids.length} per-id asset folder(s); ` +
    `${rawImages.length} flat _raw image(s); ` +
    `${storyImages.length} story image(s).`
);
