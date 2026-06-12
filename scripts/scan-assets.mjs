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
const AUDIO_FILE = "audio.mp3";

const manifest = {};

if (existsSync(exercisesDir)) {
  for (const entry of readdirSync(exercisesDir)) {
    const dir = join(exercisesDir, entry);
    if (!statSync(dir).isDirectory()) continue;

    const hasImage = existsSync(join(dir, IMAGE_FILE));
    const hasAudio = existsSync(join(dir, AUDIO_FILE));
    if (hasImage || hasAudio) {
      manifest[entry] = { image: hasImage, audio: hasAudio };
    }
  }
}

writeFileSync(outFile, JSON.stringify(manifest, null, 2) + "\n");

const ids = Object.keys(manifest);
console.log(
  `[scan-assets] ${ids.length} exercise(s) with assets: ` +
    (ids.length ? ids.join(", ") : "(none yet — using emoji + speech)")
);
