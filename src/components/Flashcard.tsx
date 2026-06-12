"use client";

import { useEffect } from "react";
import type { PhraseItem } from "@/types/phrase";
import { playPhraseItem } from "@/lib/audio";
import { markSeen } from "@/lib/progress";
import PhraseVisual from "./PhraseVisual";

type Props = {
  phrase: PhraseItem;
  showText: boolean;
  showSource: boolean;
  /** Speak automatically when the card appears. */
  autoPlay?: boolean;
};

/**
 * The core learning unit: situation visual + German phrase + audio.
 * Tapping anywhere on the card replays the audio (audio-first design).
 */
export default function Flashcard({
  phrase,
  showText,
  showSource,
  autoPlay = true,
}: Props) {
  useEffect(() => {
    markSeen(phrase.id);
    if (autoPlay) playPhraseItem(phrase);
  }, [phrase, autoPlay]);

  return (
    <div
      className="flashcard"
      role="button"
      tabIndex={0}
      onClick={() => playPhraseItem(phrase)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") playPhraseItem(phrase);
      }}
    >
      <PhraseVisual phrase={phrase} size={150} />
      {showText && <p className="phrase-de">{phrase.phraseTarget}</p>}
      {showSource && <p className="phrase-src">{phrase.phraseSource}</p>}
      <p className="tap-hint">👆 Tipp zum Hören</p>
    </div>
  );
}
