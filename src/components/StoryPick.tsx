"use client";

import { useEffect, useMemo, useState } from "react";
import ChoiceCard from "./ChoiceCard";
import { getPhrases } from "@/data/phrases";
import { playPhraseItem, playTargetThenNative } from "@/lib/audio";
import { markCorrect } from "@/lib/progress";
import type { PhraseItem, SourceLanguage } from "@/types/phrase";

type Props = {
  phrase: PhraseItem;
  source: SourceLanguage;
  onDone: () => void;
};

/** One Listen & Pick round inside a story: hear the phrase, tap the right of 2. */
export default function StoryPick({ phrase, source, onDone }: Props) {
  const options = useMemo(() => {
    const all = getPhrases(source);
    const others = all.filter((p) => p.category !== phrase.category);
    const pool = others.length ? others : all.filter((p) => p.id !== phrase.id);
    const distractor = pool[Math.floor(Math.random() * pool.length)];
    const arr = [phrase, distractor];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [phrase, source]);

  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => playPhraseItem(phrase), 300);
    return () => clearTimeout(t);
  }, [phrase]);

  function handlePick(p: PhraseItem) {
    if (picked) return;
    setPicked(p.id);
    if (p.id === phrase.id) {
      markCorrect(phrase.id);
      void playTargetThenNative(phrase).then(onDone);
    } else {
      setTimeout(() => setPicked(null), 700);
    }
  }

  return (
    <>
      <div className="play-prompt">
        <p>Was hörst du?</p>
        <AudioReplay phrase={phrase} />
      </div>
      <div className="choice-grid">
        {options.map((opt) => {
          let state: "idle" | "correct" | "wrong" = "idle";
          if (picked) {
            if (opt.id === phrase.id) state = "correct";
            else if (opt.id === picked) state = "wrong";
          }
          return (
            <ChoiceCard
              key={opt.id}
              phrase={opt}
              state={state}
              onPick={() => handlePick(opt)}
            />
          );
        })}
      </div>
      <div className="celebrate">{picked === phrase.id ? "🌟 Richtig!" : ""}</div>
    </>
  );
}

function AudioReplay({ phrase }: { phrase: PhraseItem }) {
  return (
    <button className="big-audio-btn" onClick={() => playPhraseItem(phrase)}>
      <span className="speaker" aria-hidden>
        🔊
      </span>
      Nochmal
    </button>
  );
}
