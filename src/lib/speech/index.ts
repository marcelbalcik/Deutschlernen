import type { SpeechRecognizer } from "./types";
import { WebSpeechRecognizer } from "./webSpeech";
import { VoskRecognizer } from "./vosk";

export type { RecognitionResult, SpeechRecognizer } from "./types";
export { scoreAttempt } from "./score";
export type { Outcome, ScoreResult, Forgiveness } from "./score";

/**
 * Which recognition backend to use:
 *  - "web"  → Web Speech API: fast, but the platform may send audio to the
 *             cloud (Google in Chrome). Default.
 *  - "vosk" → on-device WASM: fully private/offline, but downloads a ~45 MB
 *             German model on first use.
 */
export type SpeechBackend = "web" | "vosk";

let webSingleton: WebSpeechRecognizer | null = null;
let voskSingleton: VoskRecognizer | null = null;

export function getRecognizer(backend: SpeechBackend = "web"): SpeechRecognizer {
  if (backend === "vosk") {
    if (!voskSingleton) voskSingleton = new VoskRecognizer();
    return voskSingleton;
  }
  if (!webSingleton) webSingleton = new WebSpeechRecognizer();
  return webSingleton;
}

/** True if the Web Speech backend is available in this browser. */
export function isWebSpeechSupported(): boolean {
  if (!webSingleton) webSingleton = new WebSpeechRecognizer();
  return webSingleton.isSupported();
}

/** Backwards-compatible alias used by existing callers. */
export function isSpeechRecognitionSupported(): boolean {
  return isWebSpeechSupported();
}
