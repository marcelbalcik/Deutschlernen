"use client";

import { useState } from "react";
import type { PhraseItem } from "@/types/phrase";
import { imageUrl, hasImage } from "@/lib/assets";

type Props = {
  phrase: PhraseItem;
  size?: number;
};

/**
 * Renders a phrase's visual. Tries the real illustration at the exercise
 * folder (public/exercises/<id>/image.png); if it isn't there yet, falls back
 * to the emoji placeholder. Dropping an image into the folder is enough — no
 * code or data change. A plain <img> (not next/image) is used so the onError
 * fallback works cleanly for files that don't exist.
 */
export default function PhraseVisual({ phrase, size = 140 }: Props) {
  const [failed, setFailed] = useState(false);

  // Show a picture if there's an explicit override (a _raw image) OR the build
  // scan found a per-id image. Otherwise show the emoji and don't request a file
  // (avoids a 404 per phrase while still in the emoji-placeholder phase). The
  // onError handler is a safety net if a mapped file is missing/misnamed.
  const hasPicture = !!phrase.imageAsset || hasImage(phrase);
  if (failed || !hasPicture) {
    return (
      <span className="visual" style={{ fontSize: size }} aria-hidden>
        {phrase.emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl(phrase)}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      onError={() => setFailed(true)}
    />
  );
}
