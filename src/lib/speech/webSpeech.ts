import type { RecognitionResult, SpeechRecognizer } from "./types";

// Web Speech API adapter.
//
// Works in Chrome, Edge and Android System WebView (so it carries into a
// Capacitor APK). NOT available in Firefox or iOS Safari — callers must check
// isSupported() and fall back to record-and-playback.
//
// Privacy note: Chrome's implementation streams audio to Google for
// recognition. We never store or upload anything ourselves, but for a fully
// private/offline build, swap this adapter for an on-device backend (Vosk or a
// native plugin) behind the same SpeechRecognizer interface.

// Minimal typings for the (non-standard) Web Speech API.
type SpeechRecognitionResultLike = {
  0: { transcript: string; confidence: number };
  isFinal: boolean;
  length: number;
};
type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onsoundstart: (() => void) | null;
}

function getCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export class WebSpeechRecognizer implements SpeechRecognizer {
  private active: SpeechRecognitionLike | null = null;

  isSupported(): boolean {
    return getCtor() !== null;
  }

  listenOnce(opts: {
    lang: string;
    onSpeechStart?: () => void;
    timeoutMs?: number;
  }): Promise<RecognitionResult> {
    const Ctor = getCtor();
    if (!Ctor) {
      return Promise.resolve({
        transcript: "",
        confidence: 0,
        heardSomething: false,
      });
    }

    return new Promise((resolve) => {
      const rec = new Ctor();
      this.active = rec;
      rec.lang = opts.lang;
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      let heardSomething = false;
      let settled = false;
      const finish = (result: RecognitionResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.active = null;
        resolve(result);
      };

      const timer = setTimeout(() => {
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
      }, opts.timeoutMs ?? 6000);

      const markHeard = () => {
        heardSomething = true;
        opts.onSpeechStart?.();
      };
      rec.onsoundstart = markHeard;
      rec.onspeechstart = markHeard;

      rec.onresult = (e) => {
        const r = e.results[0];
        const alt = r && r[0];
        finish({
          transcript: alt?.transcript ?? "",
          confidence: alt?.confidence ?? 0,
          heardSomething: true,
        });
      };
      rec.onerror = () => {
        // "no-speech", "aborted", permission errors, etc. — resolve gently.
        finish({ transcript: "", confidence: 0, heardSomething });
      };
      rec.onend = () => {
        finish({ transcript: "", confidence: 0, heardSomething });
      };

      try {
        rec.start();
      } catch {
        finish({ transcript: "", confidence: 0, heardSomething: false });
      }
    });
  }

  abort(): void {
    try {
      this.active?.abort();
    } catch {
      /* ignore */
    }
    this.active = null;
  }
}
