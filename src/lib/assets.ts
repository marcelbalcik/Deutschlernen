import type { PhraseItem } from "@/types/phrase";
import manifest from "@/data/assets.generated.json";

// Manifest of which exercises have real assets, produced by scripts/scan-assets.mjs.
type AssetFlags = { image?: boolean; audio?: boolean };
const ASSETS = manifest as Record<string, AssetFlags>;

/** True if a real illustration exists for this phrase. */
export function hasImage(item: Pick<PhraseItem, "id">): boolean {
  return !!ASSETS[item.id]?.image;
}

/** True if a real audio recording exists for this phrase. */
export function hasAudio(item: Pick<PhraseItem, "id">): boolean {
  return !!ASSETS[item.id]?.audio;
}

// ---------------------------------------------------------------------------
// Per-exercise asset convention.
//
// Each exercise/phrase gets its OWN folder under /public/exercises/<id>/ that
// holds one image and one sound:
//
//   public/exercises/eating_dont_like_this/image.png
//   public/exercises/eating_dont_like_this/audio.mp3
//
// You just drop the two files into the folder named after the phrase `id` —
// no code or data changes needed. Until a file exists, the app falls back to
// the emoji placeholder (image) and browser German speech (audio), so the app
// is always fully usable while you fill in real assets one exercise at a time.
//
// To override the convention for a single phrase (different name/extension),
// set `imageAsset` / `audioAsset` on that phrase in src/data/phrases.ts.
// ---------------------------------------------------------------------------

export const EXERCISES_DIR = "/exercises";

/** Standardised filenames inside each exercise folder. */
export const IMAGE_FILE = "image.png";
export const AUDIO_FILE = "audio.mp3";

export function imageUrl(item: Pick<PhraseItem, "id" | "imageAsset">): string {
  return item.imageAsset ?? `${EXERCISES_DIR}/${item.id}/${IMAGE_FILE}`;
}

export function audioUrl(item: Pick<PhraseItem, "id" | "audioAsset">): string {
  return item.audioAsset ?? `${EXERCISES_DIR}/${item.id}/${AUDIO_FILE}`;
}
