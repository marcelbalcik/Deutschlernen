// Audio uses the browser's speech synthesis (Web Speech API) until real
// recordings are added: German for the target phrase and the family's language
// for the translation. Recordings, when present, are preferred automatically:
//   - German:  public/exercises/<id>/audio.mp3
//   - Native:  public/exercises/<id>/audio.en.mp3 | audio.tr.mp3
//
// All functions are safe to call on the server / in unsupported browsers.

import {
  audioUrl,
  hasAudio,
  hasNativeAudio,
  nativeAudioUrl,
} from "./assets";
import type { PhraseItem, SourceLanguage } from "@/types/phrase";

const TARGET_TTS_LANG = "de-DE";
// BCP-47 voice tags for each family language.
const SOURCE_TTS_LANG: Record<SourceLanguage, string> = {
  en: "en-US",
  tr: "tr-TR",
};

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

/**
 * Speak text in a language. Resolves when finished (or immediately if speech
 * isn't supported). Slightly slowed for young learners.
 */
export function speak(
  text: string,
  lang: string,
  options?: { rate?: number }
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = options?.rate ?? 0.85;
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
    // Safety net: some engines never fire onend — resolve after a max duration.
    setTimeout(finish, Math.max(2500, text.length * 120));

    window.speechSynthesis.speak(utterance);
  });
}

/** Fire-and-forget German speech (kept for existing callers). */
export function speakGerman(text: string, options?: { rate?: number }): void {
  void speak(text, TARGET_TTS_LANG, options);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    stopSpeaking();
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("audio failed"));
    audio.play().then(undefined, reject);
  });
}

/** Play the German phrase (recording if present, else speech). Resolves when done. */
export function playTarget(item: PhraseItem): Promise<void> {
  if (hasAudio(item)) {
    return playUrl(audioUrl(item)).catch(() =>
      speak(item.phraseTarget, TARGET_TTS_LANG)
    );
  }
  return speak(item.phraseTarget, TARGET_TTS_LANG);
}

/** Play the native-language translation (recording if present, else speech). */
export function playNative(item: PhraseItem): Promise<void> {
  const lang = SOURCE_TTS_LANG[item.sourceLanguage] ?? "en-US";
  if (hasNativeAudio(item, item.sourceLanguage)) {
    return playUrl(nativeAudioUrl(item, item.sourceLanguage)).catch(() =>
      speak(item.phraseSource, lang)
    );
  }
  return speak(item.phraseSource, lang);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * End-of-exercise reinforcement: hear the German phrase again, then its
 * translation in the child's language. This is what builds the meaning link.
 */
export async function playTargetThenNative(item: PhraseItem): Promise<void> {
  await playTarget(item);
  await delay(350);
  await playNative(item);
}

/** Fire-and-forget German playback (recording or speech). */
export function playPhraseItem(item: PhraseItem): void {
  void playTarget(item);
}

/** Whether spoken audio is available in this environment. */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}
