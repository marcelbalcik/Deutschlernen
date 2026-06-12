"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Flashcard from "@/components/Flashcard";
import ProgressDots from "@/components/ProgressDots";
import AudioButton from "@/components/AudioButton";
import TopBar from "@/components/TopBar";
import { getPhrasesByCategory } from "@/data/phrases";
import { getCategory } from "@/data/categories";
import { useSettings } from "@/lib/settings";

/** Flashcard deck for one category. Swipe-free: big Next/Back buttons. */
export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = String(params.category);
  const { ready, source, showText } = useSettings();

  const category = getCategory(categoryId);
  const phrases = useMemo(
    () => getPhrasesByCategory(categoryId, source),
    [categoryId, source]
  );

  const [index, setIndex] = useState(0);

  if (!category || phrases.length === 0) {
    return (
      <>
        <TopBar title="Hoppla" backHref="/" />
        <p style={{ textAlign: "center" }}>Diese Gruppe gibt es nicht.</p>
      </>
    );
  }

  // Wait for client settings so we don't flash the wrong source language.
  if (!ready) return <TopBar title={category.title} backHref="/" />;

  const phrase = phrases[index];
  const isLast = index === phrases.length - 1;

  return (
    <>
      <TopBar title={category.title} backHref="/" />

      <ProgressDots total={phrases.length} current={index} />

      <Flashcard phrase={phrase} showText={showText} showSource={false} />

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <AudioButton phrase={phrase} label="Nochmal hören" />
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
            onClick={() => router.push(`/play/${categoryId}`)}
            aria-label="Play game"
          >
            🎮
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
