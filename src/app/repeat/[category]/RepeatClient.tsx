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
import { playTarget, playTargetThenNative } from "@/lib/audio";

// Keep speaking sessions short for young children.
const SESSION_SIZE = 8;

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
 * by its translation in their own language. Forgiving by design — every attempt
 * is encouraged, never marked wrong. The child advances at their own pace.
 */
export default function RepeatClient() {
  const params = useParams();
  const router = useRouter();
  const categoryId = String(params.category);
  const { ready, showText, source } = useSettings();

  const category = getCategory(categoryId);
  const phrases = useMemo(
    () => sample(getPhrasesByCategory(categoryId, source), SESSION_SIZE),
    [categoryId, source]
  );

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  const phrase = phrases[index];

  // Auto-play the German phrase when a new item appears.
  useEffect(() => {
    if (phrase) {
      const t = setTimeout(() => void playTarget(phrase), 350);
      return () => clearTimeout(t);
    }
  }, [phrase]);

  if (!category || phrases.length === 0) {
    return (
      <>
        <TopBar title="Hoppla" backHref="/" />
        <p style={{ textAlign: "center" }}>Diese Gruppe gibt es nicht.</p>
      </>
    );
  }
  if (!ready) return <TopBar title={category.title} backHref="/repeat" />;

  const isLast = index === phrases.length - 1;

  return (
    <>
      <TopBar title={`${category.title} · Sprechen`} backHref="/repeat" />
      <ProgressDots total={phrases.length} current={index} done={done} />

      <div className="flashcard" style={{ cursor: "default" }}>
        <PhraseVisual phrase={phrase} size={130} />
        {showText && <p className="phrase-de">{phrase.phraseTarget}</p>}
        <AudioButton phrase={phrase} label="Hör zu" />
        <RepeatButton
          phrase={phrase}
          onSuccess={() => {
            setDone((d) => (d.includes(index) ? d : [...d, index]));
            // Reinforcement: hear it again in German, then in the child's language.
            void playTargetThenNative(phrase);
          }}
        />
      </div>

      <div className="nav-row">
        <button
          className="nav-btn"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Previous"
        >
          ⬅️
        </button>
        {isLast ? (
          <button
            className="nav-btn primary"
            onClick={() => router.push("/")}
            aria-label="Done"
          >
            🏠
          </button>
        ) : (
          <button
            className="nav-btn primary"
            onClick={() => setIndex((i) => Math.min(phrases.length - 1, i + 1))}
            aria-label="Next"
          >
            ➡️
          </button>
        )}
      </div>
    </>
  );
}
