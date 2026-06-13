// Maps a phrase id to an image filename you uploaded to
// public/exercises/_raw/. This lets you upload images with ANY filename
// (e.g. "feelings_body_026.png") without renaming — just point each phrase at
// its file here and the app uses it.
//
// Resolution order for a phrase's picture:
//   1. an entry in this map  -> /exercises/_raw/<filename>
//   2. a per-id folder file  -> /exercises/<id>/image.png
//   3. the emoji placeholder
//
// Leave an id out to fall back to (2) or (3).

export const RAW_IMAGE_DIR = "/exercises/_raw";

export const IMAGE_OVERRIDES: Record<string, string> = {
  // Filled in after the raw images are uploaded, e.g.:
  // health_scared: "feelings_body_026.png",
};
