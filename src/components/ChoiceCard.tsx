"use client";

import type { PhraseItem } from "@/types/phrase";
import PhraseVisual from "./PhraseVisual";

type Props = {
  phrase: PhraseItem;
  state: "idle" | "correct" | "wrong";
  onPick: () => void;
};

/** A tappable picture choice in the Listen & Tap game. */
export default function ChoiceCard({ phrase, state, onPick }: Props) {
  const cls =
    state === "correct"
      ? "choice-card correct"
      : state === "wrong"
        ? "choice-card wrong"
        : "choice-card";

  return (
    <button className={cls} onClick={onPick} aria-label={phrase.phraseSource}>
      <PhraseVisual phrase={phrase} size={220} />
    </button>
  );
}
