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

  // No manifest entry → don't even request the file; show the emoji. (Avoids a
  // 404 per phrase while you're still in the emoji-placeholder phase.)
  if (failed || !hasImage(phrase)) {
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
