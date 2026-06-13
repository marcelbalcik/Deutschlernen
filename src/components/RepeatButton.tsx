"use client";

import { useEffect, useRef, useState } from "react";
import type { PhraseItem } from "@/types/phrase";
import {
  getRecognizer,
  isSpeechRecognitionSupported,
  scoreAttempt,
  type Outcome,
} from "@/lib/speech";
import {
  isRecordingSupported,
  startRecording,
  type SimpleRecorder,
} from "@/lib/speech/recorder";
import { playPhraseItem } from "@/lib/audio";
import { markSpoken } from "@/lib/progress";

type Mode = "recognize" | "record" | "none";
type State = "idle" | "listening" | "feedback";

type Props = {
  phrase: PhraseItem;
  onSuccess?: () => void;
};

// Child-facing feedback. Never negative — the worst case is a friendly retry.
const FEEDBACK: Record<Outcome, { emoji: string; text: string }> = {
  great: { emoji: "🌟", text: "Toll!" },
  close: { emoji: "👍", text: "Super gemacht!" },
  again: { emoji: "🙂", text: "Nochmal?" },
};

/**
 * "Sprich nach" (say it back). Tapping the mic lets the child repeat the phrase.
 *
 * - If speech recognition is available, we listen and score *forgivingly*.
 * - Otherwise we record and play the child back, then celebrate.
 * Either way there is no failure state — every attempt is encouraged.
 */
export default function RepeatButton({ phrase, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>("none");
  const [state, setState] = useState<State>("idle");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const recorderRef = useRef<SimpleRecorder | null>(null);

  // Decide the backend on the client (APIs aren't available during SSR).
  useEffect(() => {
    if (isSpeechRecognitionSupported()) setMode("recognize");
    else if (isRecordingSupported()) setMode("record");
    else setMode("none");
  }, []);

  // Reset feedback when moving to a new phrase.
  useEffect(() => {
    setState("idle");
    setOutcome(null);
  }, [phrase.id]);

  function celebrate(o: Outcome) {
    setOutcome(o);
    setState("feedback");
    if (o !== "again") {
      markSpoken(phrase.id);
      onSuccess?.();
    }
  }

  async function handleRecognize() {
    setState("listening");
    setOutcome(null);
    const result = await getRecognizer().listenOnce({
      lang: "de-DE",
      timeoutMs: 6000,
    });
    const score = scoreAttempt(phrase.phraseTarget, result.transcript, {
      heardSomething: result.heardSomething,
      forgiveness: "high",
    });
    celebrate(score.outcome);
  }

  async function handleRecordStart() {
    try {
      recorderRef.current = await startRecording();
      setState("listening");
      setOutcome(null);
    } catch {
      // Permission denied or no mic — just encourage and move on.
      celebrate("close");
    }
  }

  async function handleRecordStop() {
    const rec = recorderRef.current;
    recorderRef.current = null;
    const url = rec ? await rec.stop() : null;
    if (url) {
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play().catch(() => URL.revokeObjectURL(url));
    }
    celebrate("great"); // hearing yourself back always earns a star
  }

  if (mode === "none") return null; // no mic capability at all

  // ----- Recognize mode -----
  if (mode === "recognize") {
    return (
      <div className="repeat">
        <button
          className={`mic-btn ${state === "listening" ? "live" : ""}`}
          onClick={state === "listening" ? undefined : handleRecognize}
          disabled={state === "listening"}
          aria-label="Say the phrase"
        >
          {state === "listening" ? "🎙️" : "🎤"}
          <span className="mic-label">
            {state === "listening" ? "Ich höre zu…" : "Sprich nach"}
          </span>
        </button>
        <Feedback outcome={state === "feedback" ? outcome : null} phrase={phrase} />
      </div>
    );
  }

  // ----- Record-and-playback mode -----
  return (
    <div className="repeat">
      <button
        className={`mic-btn ${state === "listening" ? "live" : ""}`}
        onClick={state === "listening" ? handleRecordStop : handleRecordStart}
        aria-label="Record yourself saying the phrase"
      >
        {state === "listening" ? "⏹️" : "🎤"}
        <span className="mic-label">
          {state === "listening" ? "Tipp zum Stoppen" : "Sprich nach"}
        </span>
      </button>
      <Feedback outcome={state === "feedback" ? outcome : null} phrase={phrase} />
    </div>
  );
}

function Feedback({
  outcome,
  phrase,
}: {
  outcome: Outcome | null;
  phrase: PhraseItem;
}) {
  if (!outcome) return <div className="repeat-feedback" />;
  const f = FEEDBACK[outcome];
  return (
    <div className="repeat-feedback show">
      <span className="rf-emoji" aria-hidden>
        {f.emoji}
      </span>
      <span className="rf-text">{f.text}</span>
      {outcome === "again" && (
        <button
          className="rf-hear"
          onClick={() => playPhraseItem(phrase)}
          aria-label="Hear it again"
        >
          🔊 Hör nochmal
        </button>
      )}
    </div>
  );
}
