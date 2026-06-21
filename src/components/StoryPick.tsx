"use client";

import { useEffect, useMemo, useState } from "react";
import ChoiceCard from "./ChoiceCard";
import Celebrate from "./Celebrate";
import CatchStar from "./CatchStar";
import { getPhrases } from "@/data/phrases";
import { playPhraseItem, playTargetThenNative } from "@/lib/audio";
import { sfxCorrect, sfxWrong } from "@/lib/sfx";
import { addStars, markCorrect } from "@/lib/progress";
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
  const [fire, setFire] = useState(0);
  const [catching, setCatching] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => playPhraseItem(phrase), 300);
    return () => clearTimeout(t);
  }, [phrase]);

  function handlePick(p: PhraseItem) {
    if (picked) return;
    setPicked(p.id);
    if (p.id === phrase.id) {
      markCorrect(phrase.id);
      sfxCorrect();
      setCatching(true);
    } else {
      sfxWrong();
      setTimeout(() => setPicked(null), 700);
    }
  }

  function handleCaught() {
    setCatching(false);
    addStars(1);
    setFire((f) => f + 1);
    void playTargetThenNative(phrase).then(onDone);
  }

  return (
    <>
      <Celebrate fire={fire} />
      {catching && <CatchStar onCatch={handleCaught} />}
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
      <div
        className={`celebrate ${picked && picked !== phrase.id ? "is-wrong" : ""}`}
      >
        {picked ? (
          picked === phrase.id ? (
            <>
              <span className="cheer-fox" aria-hidden>
                🦊
              </span>{" "}
              Super! Richtig!
            </>
          ) : (
            "Probier nochmal 💪"
          )
        ) : (
          ""
        )}
      </div>
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
