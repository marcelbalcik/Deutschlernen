"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ChoiceCard from "@/components/ChoiceCard";
import ProgressDots from "@/components/ProgressDots";
import AudioButton from "@/components/AudioButton";
import TopBar from "@/components/TopBar";
import { getPhrases, getPhrasesByCategory } from "@/data/phrases";
import { getCategory } from "@/data/categories";
import { useSettings } from "@/lib/settings";
import { playPhraseItem, playTargetThenNative } from "@/lib/audio";
import { markCorrect } from "@/lib/progress";
import type { PhraseItem } from "@/types/phrase";

type Round = {
  target: PhraseItem;
  options: PhraseItem[];
};

// Stable shuffle helper.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Listen & Pick: the app speaks a German phrase, the child taps the matching
 * picture out of 2. Wrong taps are gentle (no score loss); a correct tap
 * celebrates, then replays the German phrase followed by its translation in the
 * child's language, and advances. Recognition before production.
 */
export default function PlayClient() {
  const params = useParams();
  const router = useRouter();
  const categoryId = String(params.category);
  const { ready, source } = useSettings();

  const category = getCategory(categoryId);

  const rounds: Round[] = useMemo(() => {
    if (!ready) return [];
    const inCategory = getPhrasesByCategory(categoryId, source);
    const all = getPhrases(source);
    return shuffle(inCategory).map((target) => {
      // Two cards: the correct one plus a single distractor.
      const distractors = shuffle(
        all.filter((p) => p.id !== target.id)
      ).slice(0, 1);
      return { target, options: shuffle([target, ...distractors]) };
    });
  }, [categoryId, source, ready]);

  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [solved, setSolved] = useState<number[]>([]);

  const current = rounds[round];

  // Speak the target at the start of each round.
  useEffect(() => {
    if (current) {
      const t = setTimeout(() => playPhraseItem(current.target), 350);
      return () => clearTimeout(t);
    }
  }, [current]);

  if (!category) {
    return (
      <>
        <TopBar title="Hoppla" backHref="/" />
        <p style={{ textAlign: "center" }}>Diese Gruppe gibt es nicht.</p>
      </>
    );
  }

  if (!ready || rounds.length === 0) {
    return <TopBar title={category.title} backHref="/play" />;
  }

  // Finished all rounds.
  if (round >= rounds.length) {
    return (
      <>
        <TopBar title={category.title} backHref="/play" />
        <div className="flashcard" style={{ cursor: "default" }}>
          <span className="visual" style={{ fontSize: 120 }} aria-hidden>
            🎉
          </span>
          <p className="phrase-de">Super gemacht!</p>
        </div>
        <div className="mode-buttons">
          <button
            className="link-btn"
            onClick={() => router.push(`/repeat/${categoryId}`)}
          >
            🎤 Sprich nach
          </button>
          <button
            className="link-btn"
            onClick={() => {
              setRound(0);
              setSolved([]);
              setPicked(null);
            }}
          >
            🔁 Nochmal spielen
          </button>
          <button className="link-btn" onClick={() => router.push("/")}>
            🏠 Startseite
          </button>
        </div>
      </>
    );
  }

  function handlePick(p: PhraseItem) {
    if (picked) return; // ignore taps until the round resolves
    setPicked(p.id);

    if (p.id === current.target.id) {
      const target = current.target;
      markCorrect(target.id);
      setSolved((s) => [...s, round]);
      // Reinforcement: hear the German phrase again, then the translation, then
      // move on. Kicked off inside the tap so mobile audio is allowed to play.
      void playTargetThenNative(target).finally(() => {
        setPicked(null);
        setRound((r) => r + 1);
      });
    } else {
      // Gentle: clear the wrong state and let them try again.
      setTimeout(() => setPicked(null), 700);
    }
  }

  return (
    <>
      <TopBar title={category.title} backHref="/play" />
      <ProgressDots total={rounds.length} current={round} done={solved} />

      <div className="play-prompt">
        <p>Was hörst du? Tippe das richtige Bild.</p>
        <AudioButton phrase={current.target} label="🔊 Nochmal" />
      </div>

      <div className="choice-grid">
        {current.options.map((opt) => {
          let state: "idle" | "correct" | "wrong" = "idle";
          if (picked) {
            if (opt.id === current.target.id) state = "correct";
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

      <div className="celebrate">
        {picked === current.target.id ? "🌟 Richtig!" : ""}
      </div>
    </>
  );
}
