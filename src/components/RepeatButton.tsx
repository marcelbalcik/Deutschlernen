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
import { playPhraseItem, playTarget, stopAudio } from "@/lib/audio";
import { markSpoken } from "@/lib/progress";
import { useSettings } from "@/lib/settings";

type Mode = "recognize" | "record" | "none";
type Phase = "idle" | "prep" | "playing" | "listening" | "done";

// Ignore recordings shorter than this — a quick blip is noise, not an attempt.
const MIN_RECORD_MS = 700;

type Props = {
  phrase: PhraseItem;
  onSuccess?: () => void;
};

const FEEDBACK: Record<Outcome, { emoji: string; text: string }> = {
  great: { emoji: "🌟", text: "Toll!" },
  close: { emoji: "👍", text: "Super gemacht!" },
  again: { emoji: "🙂", text: "Nochmal?" },
};

/**
 * Say-it-back, hands-free. When the phrase appears it plays the German once and
 * then AUTOMATICALLY starts listening — the child just speaks, no button to
 * press. One silent auto-retry; after that the mic is tappable to try again.
 * (Record-and-playback is the tap-based iOS fallback when recognition is absent.)
 */
export default function RepeatButton({ phrase, onSuccess }: Props) {
  const { ready, speechBackend } = useSettings();
  const [mode, setMode] = useState<Mode>("none");
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const recorderRef = useRef<SimpleRecorder | null>(null);
  const recordStartRef = useRef<number>(0);
  const backendRef = useRef<SpeechBackend>("web");
  const activeRef = useRef(true);
  const autoRetryRef = useRef(0);

  // Decide the backend once settings load.
  useEffect(() => {
    if (!ready) return;
    backendRef.current = speechBackend;
    const voskUsable =
      speechBackend === "vosk" && getRecognizer("vosk").isSupported();
    if (voskUsable || isWebSpeechSupported()) setMode("recognize");
    else if (isRecordingSupported()) setMode("record");
    else setMode("none");
  }, [ready, speechBackend]);

  async function listenAndScore() {
    let recognizer = getRecognizer(backendRef.current);
    if (backendRef.current === "vosk" && recognizer.prepare) {
      setPhase("prep");
      const ok = await recognizer.prepare();
      if (!activeRef.current) return;
      if (!ok && isWebSpeechSupported()) {
        backendRef.current = "web";
        recognizer = getRecognizer("web");
      }
    }
    setPhase("listening");
    const result = await recognizer.listenOnce({
      lang: "de-DE",
      timeoutMs: backendRef.current === "vosk" ? 7000 : 6000,
    });
    if (!activeRef.current) return;
    const score = scoreAttempt(phrase.phraseTarget, result.transcript, {
      forgiveness: "high",
    });
    // One silent auto-retry on a miss before showing "try again".
    if (score.outcome === "again" && autoRetryRef.current < 1) {
      autoRetryRef.current += 1;
      setTimeout(() => {
        if (activeRef.current) void listenAndScore();
      }, 700);
      return;
    }
    setOutcome(score.outcome);
    setPhase("done");
    if (score.outcome !== "again") {
      markSpoken(phrase.id);
      onSuccess?.();
    }
  }

  async function playThenListen() {
    setOutcome(null);
    setPhase("playing");
    await playTarget(phrase);
    if (!activeRef.current) return;
    await listenAndScore();
  }

  // Auto-run the play→listen sequence when the phrase appears (recognize mode).
  useEffect(() => {
    if (mode !== "recognize") return;
    activeRef.current = true;
    autoRetryRef.current = 0;
    void playThenListen();
    return () => {
      activeRef.current = false;
      stopAudio();
      try {
        getRecognizer(backendRef.current).abort();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phrase.id]);

  function manualRetry() {
    autoRetryRef.current = 0;
    void playThenListen();
  }

  if (mode === "none") return null;

  if (mode === "recognize") {
    const busy = phase === "playing" || phase === "prep" || phase === "listening";
    const label =
      phase === "prep"
        ? "Lädt…"
        : phase === "playing"
          ? "Hör zu…"
          : phase === "listening"
            ? "Sprich jetzt!"
            : outcome === "again"
              ? "Nochmal?"
              : "Sprich nach";
    return (
      <div className="repeat">
        <button
          className={`mic-btn ${phase === "listening" ? "live" : ""}`}
          onClick={busy ? undefined : manualRetry}
          disabled={busy}
          aria-label="Speak the phrase"
        >
          {phase === "prep" ? "⏳" : phase === "listening" ? "🎙️" : "🎤"}
          <span className="mic-label">{label}</span>
        </button>
        <Feedback outcome={phase === "done" ? outcome : null} phrase={phrase} />
      </div>
    );
  }

  // Record-and-playback mode (tap-based iOS fallback).
  return (
    <div className="repeat">
      <button
        className={`mic-btn ${phase === "listening" ? "live" : ""}`}
        onClick={phase === "listening" ? handleRecordStop : handleRecordStart}
        aria-label="Record yourself saying the phrase"
      >
        {phase === "listening" ? "⏹️" : "🎤"}
        <span className="mic-label">
          {phase === "listening" ? "Tipp zum Stoppen" : "Sprich nach"}
        </span>
      </button>
      <Feedback outcome={phase === "done" ? outcome : null} phrase={phrase} />
    </div>
  );

  function celebrate(o: Outcome) {
    setOutcome(o);
    setPhase("done");
    if (o !== "again") {
      markSpoken(phrase.id);
      onSuccess?.();
    }
  }

  async function handleRecordStart() {
    try {
      recorderRef.current = await startRecording();
      recordStartRef.current = Date.now();
      setOutcome(null);
      setPhase("listening");
    } catch {
      celebrate("again");
    }
  }

  async function handleRecordStop() {
    const rec = recorderRef.current;
    recorderRef.current = null;
    const elapsed = Date.now() - recordStartRef.current;
    const url = rec ? await rec.stop() : null;
    if (!url || elapsed < MIN_RECORD_MS) {
      celebrate("again");
      return;
    }
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.play().catch(() => URL.revokeObjectURL(url));
    celebrate("great");
  }
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
