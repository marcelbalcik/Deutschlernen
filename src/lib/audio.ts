// Audio uses the browser's speech synthesis (Web Speech API) until real
// recordings are added: German for the target phrase and the family's language
// for the translation. Recordings, when present, are preferred automatically.
//
// Playback is centrally cancelable: stopAudio() halts speech AND any playing
// audio file, and invalidates any in-flight "German then native" sequence so
// nothing keeps talking after the child navigates or taps something else.

import {
  audioUrl,
  hasAudio,
  hasNativeAudio,
  nativeAudioUrl,
} from "./assets";
import type { PhraseItem, SourceLanguage } from "@/types/phrase";

const TARGET_TTS_LANG = "de-DE";
const SOURCE_TTS_LANG: Record<SourceLanguage, string> = {
  en: "en-US",
  tr: "tr-TR",
};

let currentAudio: HTMLAudioElement | null = null;
// Bumped every time playback starts or is stopped; running sequences compare
// against it to know whether they've been superseded/cancelled.
let generation = 0;

// Cache the best voice per language (voices load asynchronously).
const voiceCache = new Map<string, SpeechSynthesisVoice | null>();

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  if (voiceCache.has(lang)) return voiceCache.get(lang)!;
  const voices = window.speechSynthesis.getVoices();
  const lc = lang.toLowerCase();
  const prefix = lc.split("-")[0];
  const voice =
    voices.find((v) => v.lang.toLowerCase() === lc) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
    null;
  voiceCache.set(lang, voice);
  return voice;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => voiceCache.clear();
}

/** Stop all audio: cancel speech, pause any audio file, cancel sequences. */
export function stopAudio(): void {
  generation++;
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch {
      /* ignore */
    }
    currentAudio = null;
  }
}

// Backwards-compatible alias.
export const stopSpeaking = stopAudio;

// --- Low-level players (do NOT touch `generation`; callers manage it) ---

function ttsRaw(
  text: string,
  lang: string,
  opts?: { rate?: number }
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = opts?.rate ?? 0.85;
    utterance.pitch = 1.05;
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    setTimeout(finish, Math.max(2500, text.length * 120));
    window.speechSynthesis.speak(utterance);
  });
}

function audioRaw(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    let done = false;
    const ok = () => {
      if (done) return;
      done = true;
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.onended = ok;
    audio.onpause = ok; // resolve when stopAudio() pauses it
    audio.onerror = () => {
      if (done) return;
      done = true;
      if (currentAudio === audio) currentAudio = null;
      reject(new Error("audio failed"));
    };
    audio.play().then(undefined, () => {
      if (done) return;
      done = true;
      reject(new Error("play blocked"));
    });
  });
}

function playTargetRaw(item: PhraseItem): Promise<void> {
  if (hasAudio(item)) {
    return audioRaw(audioUrl(item)).catch(() =>
      ttsRaw(item.phraseTarget, TARGET_TTS_LANG)
    );
  }
  return ttsRaw(item.phraseTarget, TARGET_TTS_LANG);
}

function playNativeRaw(item: PhraseItem): Promise<void> {
  const lang = SOURCE_TTS_LANG[item.sourceLanguage] ?? "en-US";
  if (hasNativeAudio(item, item.sourceLanguage)) {
    return audioRaw(nativeAudioUrl(item, item.sourceLanguage)).catch(() =>
      ttsRaw(item.phraseSource, lang)
    );
  }
  return ttsRaw(item.phraseSource, lang);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Public players (each cancels whatever was playing first) ---

/** Speak arbitrary text in a language (cancels prior playback). */
export function speak(
  text: string,
  lang: string,
  opts?: { rate?: number }
): Promise<void> {
  stopAudio();
  return ttsRaw(text, lang, opts);
}

/** Fire-and-forget German speech (kept for existing callers). */
export function speakGerman(text: string, opts?: { rate?: number }): void {
  void speak(text, TARGET_TTS_LANG, opts);
}

/** Play the German phrase (recording or speech), cancelling prior playback. */
export function playTarget(item: PhraseItem): Promise<void> {
  stopAudio();
  return playTargetRaw(item);
}

/** Fire-and-forget German playback. */
export function playPhraseItem(item: PhraseItem): void {
  stopAudio();
  void playTargetRaw(item);
}

/**
 * Reinforcement: hear the German phrase again, then its translation. Cancelable
 * — if anything else plays or stopAudio() is called mid-sequence, it bails out
 * instead of talking over the next screen.
 */
export async function playTargetThenNative(item: PhraseItem): Promise<void> {
  stopAudio();
  const mine = generation;
  await playTargetRaw(item);
  if (mine !== generation) return;
  await delay(350);
  if (mine !== generation) return;
  await playNativeRaw(item);
}

/** Whether spoken audio is available in this environment. */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}
