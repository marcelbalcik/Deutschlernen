"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import ProgressDots from "@/components/ProgressDots";
import AudioButton from "@/components/AudioButton";
import RepeatButton from "@/components/RepeatButton";
import PhraseVisual from "@/components/PhraseVisual";
import StoryVisual from "@/components/StoryVisual";
import StoryPick from "@/components/StoryPick";
import { getStory } from "@/data/stories";
import { getPhraseById } from "@/data/phrases";
import { useSettings } from "@/lib/settings";
import { playTarget, playTargetThenNative, speak, stopAudio } from "@/lib/audio";

const NATIVE_LANG: Record<string, string> = { en: "en-US", tr: "tr-TR" };

/**
 * Story player: walks the story beat by beat. Narration is read aloud in the
 * family language; game beats drop into the Pick or Speak mechanic. A correct
 * pick / successful repeat advances; narration advances with a big "weiter".
 */
export default function StoryClient() {
  // NOTE: the dynamic segment is named [category] to share generateStaticParams
  // shape with the other routes; here it is the story id.
  const params = useParams();
  const router = useRouter();
  const storyId = String(params.category);
  const { ready, showText, source } = useSettings();

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

  // Auto-play: narration in the family language; game target in German.
  useEffect(() => {
    if (!ready || !step) return;
    if (step.type === "narration") {
      const t = setTimeout(
        () => void speak(step.text[source], NATIVE_LANG[source] ?? "en-US"),
        300
      );
      return () => clearTimeout(t);
    }
    if (step.type === "game" && step.mode === "speak" && gamePhrase) {
      const t = setTimeout(() => void playTarget(gamePhrase), 350);
      return () => clearTimeout(t);
    }
  }, [ready, step, gamePhrase, source]);

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
          <span className="visual" style={{ fontSize: 120 }} aria-hidden>
            🎉
          </span>
          <p className="phrase-de">Geschichte fertig!</p>
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
          <div className="flashcard" style={{ cursor: "default" }}>
            <StoryVisual
              imageId={`${story.id}_n${
                story.steps
                  .slice(0, index + 1)
                  .filter((s) => s.type === "narration").length
              }`}
              emoji={step!.emoji}
              size={260}
            />
            <p className="story-text">{step!.text[source]}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <button
              className="big-audio-btn"
              onClick={() => speak(step!.text[source], NATIVE_LANG[source] ?? "en-US")}
            >
              <span className="speaker" aria-hidden>
                🔊
              </span>
              Nochmal
            </button>
          </div>
          <button className="link-btn story-next" onClick={next}>
            Weiter ▶
          </button>
        </>
      ) : !gamePhrase ? (
        // Missing phrase — skip gracefully.
        <button className="link-btn story-next" onClick={next}>
          Weiter ▶
        </button>
      ) : step!.mode === "pick" ? (
        <StoryPick phrase={gamePhrase} source={source} onDone={next} />
      ) : (
        <>
          <div className="flashcard" style={{ cursor: "default" }}>
            <PhraseVisual phrase={gamePhrase} size={280} />
            {showText && <p className="phrase-de">{gamePhrase.phraseTarget}</p>}
            <AudioButton phrase={gamePhrase} label="Hör zu" />
            <RepeatButton
              phrase={gamePhrase}
              onSuccess={() =>
                void playTargetThenNative(gamePhrase).then(next)
              }
            />
          </div>
          <button
            className="skip-link"
            onClick={() => {
              stopAudio();
              next();
            }}
          >
            weiter ▸
          </button>
        </>
      )}
    </>
  );
}
