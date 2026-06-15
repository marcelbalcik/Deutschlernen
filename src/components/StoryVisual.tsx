"use client";

import { useState } from "react";
import { withBasePath } from "@/lib/basePath";
import storyImages from "@/data/storyImages.generated.json";

const HAVE = new Set(storyImages as string[]);

type Props = {
  imageId: string;
  emoji: string;
  size?: number;
};

/** Story narration visual: real illustration if it exists, else the emoji. */
export default function StoryVisual({ imageId, emoji, size = 200 }: Props) {
  const [failed, setFailed] = useState(false);

  if (!HAVE.has(imageId) || failed) {
    return (
      <span
        className="visual"
        style={{ fontSize: Math.min(size, 120), lineHeight: 1 }}
        aria-hidden
      >
        {emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={withBasePath(`/stories/_raw/${imageId}.png`)}
      alt=""
      style={{
        width: "100%",
        height: "auto",
        maxWidth: size,
        objectFit: "contain",
        display: "block",
        margin: "0 auto",
      }}
      onError={() => setFailed(true)}
    />
  );
}
