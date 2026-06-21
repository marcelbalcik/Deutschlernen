"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import ProgressDots from "@/components/ProgressDots";
import AudioButton from "@/components/AudioButton";
import RepeatButton from "@/components/RepeatButton";
import PhraseVisual from "@/components/PhraseVisual";
import { getPhrasesByCategory } from "@/data/phrases";
import { getCategory } from "@/data/categories";
import { useSettings } from "@/lib/settings";
import { playTargetThenNative, stopAudio } from "@/lib/audio";

function sample<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

/**
 * Speaking round: each phrase auto-plays in German ("the phrase listened"), the
 * child says it back into the mic, then hears the German phrase again followed
 * by its translation and auto-advances. No navigation arrows — a big mic is the
 * only thing to tap; a small "weiter" lets them skip if recognition struggles.
 */
export default function RepeatClient() {
  const params = useParams();
  const router = useRouter();
  const categoryId = String(params.category);
  const { ready, showText, source, cardCount } = useSettings();

  const category = getCategory(categoryId);
  const [seed, setSeed] = useState(0);
  const phrases = useMemo(
    () => sample(getPhrasesByCategory(categoryId, source), cardCount),
    // seed reshuffles a fresh session on "play again"
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryId, source, cardCount, seed]
  );

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  const phrase = phrases[index];

  // German playback + auto-listening is handled by RepeatButton per phrase.
  // Stop any audio when leaving this screen.
  useEffect(() => stopAudio, []);

  if (!category || phrases.length === 0) {
    return (
      <>
        <TopBar title="Hoppla" backHref="/" />
        <p style={{ textAlign: "center" }}>Diese Gruppe gibt es nicht.</p>
      </>
    );
  }
  if (!ready) return <TopBar title={category.title} backHref="/repeat" />;

  // Finished the session.
  if (index >= phrases.length) {
    return (
      <>
        <TopBar title={category.title} backHref="/repeat" />
        <div className="flashcard" style={{ cursor: "default" }}>
          <span className="visual" style={{ fontSize: 120 }} aria-hidden>
            🎉
          </span>
          <p className="phrase-de">Super gemacht!</p>
        </div>
        <div className="end-actions">
          <button
            className="end-btn primary"
            aria-label="Again"
            onClick={() => {
              setIndex(0);
              setDone([]);
              setSeed((s) => s + 1);
            }}
          >
            <span className="end-emoji" aria-hidden>
              🔁
            </span>
            <span className="end-label">Nochmal</span>
          </button>
          <button
            className="end-btn"
            aria-label="Home"
            onClick={() => router.push("/")}
          >
            <span className="end-emoji" aria-hidden>
              🏠
            </span>
            <span className="end-label">Start</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={category.title} backHref="/repeat" />
      <ProgressDots total={phrases.length} current={index} done={done} />

      <div className="flashcard" style={{ cursor: "default" }}>
        <PhraseVisual phrase={phrase} size={300} />
        {showText && <p className="phrase-de">{phrase.phraseTarget}</p>}
        <AudioButton phrase={phrase} label="Hör zu" />
        <RepeatButton
          phrase={phrase}
          onSuccess={() => {
            setDone((d) => (d.includes(index) ? d : [...d, index]));
            // Hear it again in German, then the translation, then move on.
            void playTargetThenNative(phrase).then(() =>
              setIndex((i) => i + 1)
            );
          }}
        />
      </div>

      <button
        className="skip-link"
        onClick={() => {
          stopAudio();
          setIndex((i) => i + 1);
        }}
      >
        weiter ▸
      </button>
    </>
  );
}
