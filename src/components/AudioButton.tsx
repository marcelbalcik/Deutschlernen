"use client";

import { playPhraseItem } from "@/lib/audio";
import type { PhraseItem } from "@/types/phrase";

type Props = {
  phrase: PhraseItem;
  label?: string;
};

/** Big, friendly "hear it again" button. Plays the phrase (recording or TTS). */
export default function AudioButton({ phrase, label = "Hör zu" }: Props) {
  return (
    <button
      className="big-audio-btn"
      onClick={() => playPhraseItem(phrase)}
      aria-label={`Play: ${phrase.phraseTarget}`}
    >
      <span className="speaker" aria-hidden>
        🔊
      </span>
      {label}
    </button>
  );
}
