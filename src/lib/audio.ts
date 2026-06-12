// Audio for the MVP uses the browser's built-in speech synthesis (Web Speech
// API). This means: no audio files to record or host, and every German phrase
// is spoken correctly today. Later, swap in real native-speaker recordings by
// checking `audioAsset` first and falling back to speech synthesis.
//
// All functions are no-ops on the server / in unsupported browsers, so they are
// safe to call from React event handlers without guards.

import { audioUrl, hasAudio } from "./assets";
import type { PhraseItem } from "@/types/phrase";

let cachedGermanVoice: SpeechSynthesisVoice | null = null;

function pickGermanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  if (cachedGermanVoice) return cachedGermanVoice;

  const voices = window.speechSynthesis.getVoices();
  // Prefer a German voice; fall back to anything starting with "de".
  const german =
    voices.find((v) => v.lang === "de-DE") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("de")) ??
    null;

  cachedGermanVoice = german;
  return german;
}

// Voices can load asynchronously; refresh our cached pick when they arrive.
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedGermanVoice = null;
    pickGermanVoice();
  };
}

/**
 * Speak a German phrase aloud. Slightly slowed down so young children can
 * follow and repeat. Cancels any phrase already playing.
 */
export function speakGerman(text: string, options?: { rate?: number }): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = options?.rate ?? 0.85; // a touch slower for learners
  utterance.pitch = 1.05;

  const voice = pickGermanVoice();
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

/**
 * Play a phrase. If a real recording exists (per the asset manifest) it plays
 * the file; otherwise it falls back to German speech synthesis.
 *
 * Important: the decision is synchronous (no awaiting before play()), so the
 * call stays inside the user's tap — required for audio to be allowed to play
 * on iOS Safari and other mobile browsers.
 */
export function playPhraseItem(item: PhraseItem): void {
  if (typeof window === "undefined") return;

  if (hasAudio(item)) {
    stopSpeaking();
    const audio = new Audio(audioUrl(item));
    // If the file is somehow unplayable, fall back to speech.
    audio.play().catch(() => speakGerman(item.phraseTarget));
    return;
  }

  speakGerman(item.phraseTarget);
}

/** Whether spoken audio is available in this environment. */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}
