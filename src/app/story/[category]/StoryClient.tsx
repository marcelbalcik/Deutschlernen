"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import ProgressDots from "@/components/ProgressDots";
import StoryVisual from "@/components/StoryVisual";
import StoryPick from "@/components/StoryPick";
import { getStory } from "@/data/stories";
import { getPhraseById } from "@/data/phrases";
import { useSettings } from "@/lib/settings";
import { speak, stopAudio } from "@/lib/audio";

/**
 * Story player: walks the story beat by beat. Narration is read aloud in the
 * family language and advances with a big "weiter"; picture-picking beats drop
 * the child into the Pick mechanic (hear the German phrase, tap the matching
 * picture), and a correct pick advances. No mic / speaking in story mode.
 */
export default function StoryClient() {
  // The dynamic segment is named [category] to share the static-export param
  // shape with the other routes; here its value is the story id.
  const params = useParams();
  const router = useRouter();
  const storyId = String(params.category);
  const { ready, source } = useSettings();

  const story = getStory(storyId);
  const [index, setIndex] = useState(0);

  const step = story?.steps[index];
  const gamePhrase = useMemo(
    () =>
      step && step.type === "game"
        ? getPhraseById(step.phraseId, source)
        : undefined,
    [step, source]
  );

  function next() {
    setIndex((i) => i + 1);
  }

  // Auto-read narration in German (with the family-language subtitle shown).
  useEffect(() => {
    if (!ready || !step || step.type !== "narration") return;
    const t = setTimeout(() => void speak(step.de, "de-DE"), 300);
    return () => clearTimeout(t);
  }, [ready, step]);

  // Stop audio on leave.
  useEffect(() => stopAudio, []);

  if (!story) {
    return (
      <>
        <TopBar title="Hoppla" backHref="/story" />
        <p style={{ textAlign: "center" }}>Diese Geschichte gibt es nicht.</p>
      </>
    );
  }
  if (!ready) return <TopBar title={story.title[source]} backHref="/story" />;

  // Finished.
  if (index >= story.steps.length) {
    return (
      <>
        <TopBar title={story.title[source]} backHref="/story" />
        <div className="flashcard" style={{ cursor: "default" }}>
          <span className="finish-mascot" aria-hidden>
            🦊
          </span>
          <p className="phrase-de">Geschafft!</p>
        </div>
        <div className="end-actions">
          <button
            className="end-btn primary"
            aria-label="Again"
            onClick={() => setIndex(0)}
          >
            <span className="end-emoji" aria-hidden>
              🔁
            </span>
            <span className="end-label">Nochmal</span>
          </button>
          <button
            className="end-btn"
            aria-label="More stories"
            onClick={() => router.push("/story")}
          >
            <span className="end-emoji" aria-hidden>
              📚
            </span>
            <span className="end-label">Geschichten</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={story.title[source]} backHref="/story" />
      <ProgressDots total={story.steps.length} current={index} />

      {step!.type === "narration" ? (
        <>
          <div className="story-scene">
            <StoryVisual
              imageId={`${story.id}_n${
                story.steps
                  .slice(0, index + 1)
                  .filter((s) => s.type === "narration").length
              }`}
              emoji={step!.emoji}
              size={200}
            />
          </div>
          <p className="story-text">{step!.de}</p>
          <p className="story-subtitle">{step!.text[source]}</p>
          <div className="story-actions">
            <button
              className="ghost-btn"
              aria-label="Hear again"
              onClick={() => speak(step!.de, "de-DE")}
            >
              🔁
            </button>
            <button className="weiter-btn" onClick={next}>
              Weiter ▶
            </button>
          </div>
        </>
      ) : !gamePhrase ? (
        <button className="weiter-btn" onClick={next} style={{ marginTop: 18 }}>
          Weiter ▶
        </button>
      ) : (
        <StoryPick phrase={gamePhrase} source={source} onDone={next} />
      )}
    </>
  );
}
