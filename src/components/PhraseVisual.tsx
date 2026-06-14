"use client";

import { useState } from "react";
import type { PhraseItem } from "@/types/phrase";
import { imageUrl, hasImage } from "@/lib/assets";

type Props = {
  phrase: PhraseItem;
  size?: number;
};

/**
 * Renders a phrase's picture, falling back to the emoji if there's no image or
 * the file fails to load. We track the *failed src* (not a boolean) so the
 * fallback is specific to one image — when the phrase changes, the new src is
 * shown again instead of the emoji sticking around.
 */
export default function PhraseVisual({ phrase, size = 140 }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const hasPicture = !!phrase.imageAsset || hasImage(phrase);
  const src = hasPicture ? imageUrl(phrase) : null;

  if (!src || failedSrc === src) {
    return (
      <span className="visual" style={{ fontSize: size }} aria-hidden>
        {phrase.emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      onError={() => setFailedSrc(src)}
    />
  );
}
