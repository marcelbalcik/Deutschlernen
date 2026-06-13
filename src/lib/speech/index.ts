import type { SpeechRecognizer } from "./types";
import { WebSpeechRecognizer } from "./webSpeech";

export type { RecognitionResult, SpeechRecognizer } from "./types";
export { scoreAttempt } from "./score";
export type { Outcome, ScoreResult, Forgiveness } from "./score";

let singleton: SpeechRecognizer | null = null;

/**
 * Returns the active recognizer. Today this is the Web Speech adapter; to make
 * the app private/offline (for the APK), return a Vosk or native-plugin
 * recognizer here instead — nothing else changes.
 */
export function getRecognizer(): SpeechRecognizer {
  if (!singleton) singleton = new WebSpeechRecognizer();
  return singleton;
}

/** True if real speech recognition is available (else use record-and-playback). */
export function isSpeechRecognitionSupported(): boolean {
  return getRecognizer().isSupported();
}
