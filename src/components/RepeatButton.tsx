"use client";

import { useEffect, useRef, useState } from "react";
import type { PhraseItem } from "@/types/phrase";
import {
  getRecognizer,
  isWebSpeechSupported,
  scoreAttempt,
  type Outcome,
  type SpeechBackend,
} from "@/lib/speech";
import {
  isRecordingSupported,
  startRecording,
  type SimpleRecorder,
} from "@/lib/speech/recorder";
import { playPhraseItem } from "@/lib/audio";
import { markSpoken } from "@/lib/progress";
import { useSettings } from "@/lib/settings";

type Mode = "recognize" | "record" | "none";
type State = "idle" | "preparing" | "listening" | "feedback";

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
 * - Recognition backend follows the parent setting: Web Speech (fast) or Vosk
 *   (private/on-device). Vosk downloads its model on first use; if it can't be
 *   loaded we fall back to Web Speech automatically.
 * - If no recognition is available at all, we record and play the child back.
 * Either way there is no failure state — every attempt is encouraged.
 */
export default function RepeatButton({ phrase, onSuccess }: Props) {
  const { ready, speechBackend } = useSettings();
  const [mode, setMode] = useState<Mode>("none");
  const [state, setState] = useState<State>("idle");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const recorderRef = useRef<SimpleRecorder | null>(null);
  // Effective backend can downgrade vosk→web at runtime if the model is missing.
  const backendRef = useRef<SpeechBackend>("web");

  // Decide the backend on the client once settings are loaded.
  useEffect(() => {
    if (!ready) return;
    backendRef.current = speechBackend;
    const voskUsable =
      speechBackend === "vosk" && getRecognizer("vosk").isSupported();
    if (voskUsable || isWebSpeechSupported()) setMode("recognize");
    else if (isRecordingSupported()) setMode("record");
    else setMode("none");
  }, [ready, speechBackend]);

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
    setOutcome(null);
    let recognizer = getRecognizer(backendRef.current);

    // Vosk needs its model; show a loading state and fall back if it fails.
    if (backendRef.current === "vosk" && recognizer.prepare) {
      setState("preparing");
      const ok = await recognizer.prepare();
      if (!ok) {
        if (isWebSpeechSupported()) {
          backendRef.current = "web";
          recognizer = getRecognizer("web");
        } else {
          celebrate("close"); // no recognition available — still encourage
          return;
        }
      }
    }

    setState("listening");
    const result = await recognizer.listenOnce({
      lang: "de-DE",
      timeoutMs: backendRef.current === "vosk" ? 7000 : 6000,
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

  if (mode === "none") return null;

  if (mode === "recognize") {
    const busy = state === "listening" || state === "preparing";
    const label =
      state === "preparing"
        ? "Lädt…"
        : state === "listening"
          ? "Ich höre zu…"
          : "Sprich nach";
    return (
      <div className="repeat">
        <button
          className={`mic-btn ${state === "listening" ? "live" : ""}`}
          onClick={busy ? undefined : handleRecognize}
          disabled={busy}
          aria-label="Say the phrase"
        >
          {state === "preparing" ? "⏳" : state === "listening" ? "🎙️" : "🎤"}
          <span className="mic-label">{label}</span>
        </button>
        <Feedback outcome={state === "feedback" ? outcome : null} phrase={phrase} />
      </div>
    );
  }

  // Record-and-playback mode.
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
