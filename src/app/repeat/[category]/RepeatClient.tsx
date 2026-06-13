"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import ProgressDots from "@/components/ProgressDots";
import AudioButton from "@/components/AudioButton";
import RepeatButton from "@/components/RepeatButton";
import PhraseVisual from "@/components/PhraseVisual";
import { getPhrasesByCategory } from "@/data/phrases";
import { getCategory } from "@/data/categories";
import { useSettings } from "@/lib/settings";

/**
 * Speaking round: for each phrase the child hears it, then says it back into
 * the mic. Forgiving by design — every attempt is encouraged, never marked
 * wrong. The child advances at their own pace.
 */
export default function RepeatClient() {
  const params = useParams();
  const router = useRouter();
  const categoryId = String(params.category);
  const { ready, showText, source } = useSettings();

  const category = getCategory(categoryId);
  const phrases = useMemo(
    () => getPhrasesByCategory(categoryId, source),
    [categoryId, source]
  );

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  if (!category || phrases.length === 0) {
    return (
      <>
        <TopBar title="Hoppla" backHref="/" />
        <p style={{ textAlign: "center" }}>Diese Gruppe gibt es nicht.</p>
      </>
    );
  }
  if (!ready) return <TopBar title={category.title} backHref="/" />;

  const phrase = phrases[index];
  const isLast = index === phrases.length - 1;

  return (
    <>
      <TopBar title={`${category.title} · Sprechen`} backHref="/" />
      <ProgressDots total={phrases.length} current={index} done={done} />

      <div className="flashcard" style={{ cursor: "default" }}>
        <PhraseVisual phrase={phrase} size={130} />
        {showText && <p className="phrase-de">{phrase.phraseTarget}</p>}
        <AudioButton phrase={phrase} label="Hör zu" />
        <RepeatButton
          phrase={phrase}
          onSuccess={() =>
            setDone((d) => (d.includes(index) ? d : [...d, index]))
          }
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
