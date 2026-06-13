import type { RecognitionResult, SpeechRecognizer } from "./types";
import type { Model, KaldiRecognizer } from "vosk-browser";

// On-device, offline speech recognition via vosk-browser (Kaldi compiled to
// WASM). The microphone audio NEVER leaves the device — this is the private
// alternative to the Web Speech API.
//
// Cost: a ~45 MB German model is downloaded once (then browser-cached). You
// must host it yourself — see public/models/README.md. The URL is configurable
// with NEXT_PUBLIC_VOSK_MODEL_URL.
//
// The heavy library + model are loaded lazily (dynamic import) so they never
// bloat the main bundle or load unless the on-device backend is actually used.

const DEFAULT_MODEL_URL =
  process.env.NEXT_PUBLIC_VOSK_MODEL_URL ?? "/models/vosk-model-small-de.tar.gz";

// One shared model load across the whole app.
let modelPromise: Promise<Model> | null = null;

async function loadModel(url: string): Promise<Model> {
  if (!modelPromise) {
    const { createModel } = await import("vosk-browser");
    modelPromise = createModel(url).catch((e) => {
      modelPromise = null; // allow retry after a failure (e.g. model missing)
      throw e;
    });
  }
  return modelPromise;
}

export class VoskRecognizer implements SpeechRecognizer {
  private modelUrl: string;
  private teardownActive: (() => void) | null = null;

  constructor(modelUrl: string = DEFAULT_MODEL_URL) {
    this.modelUrl = modelUrl;
  }

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof AudioContext !== "undefined"
    );
  }

  /** Download/initialise the model. Returns false if it can't be loaded. */
  async prepare(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      await loadModel(this.modelUrl);
      return true;
    } catch {
      return false;
    }
  }

  async listenOnce(opts: {
    lang: string;
    onSpeechStart?: () => void;
    timeoutMs?: number;
  }): Promise<RecognitionResult> {
    const empty: RecognitionResult = {
      transcript: "",
      confidence: 0,
      heardSomething: false,
    };
    if (!this.isSupported()) return empty;

    let model: Model;
    try {
      model = await loadModel(this.modelUrl);
    } catch {
      // Model missing/failed — signal "unavailable" so the caller can fall back.
      return empty;
    }

    return new Promise<RecognitionResult>((resolve) => {
      let finalText = "";
      let heard = false;
      let settled = false;

      let stream: MediaStream | null = null;
      let ctx: AudioContext | null = null;
      let node: ScriptProcessorNode | null = null;
      let source: MediaStreamAudioSourceNode | null = null;
      let sink: GainNode | null = null;
      let recognizer: KaldiRecognizer | null = null;
      let silenceTimer: ReturnType<typeof setTimeout> | null = null;
      let maxTimer: ReturnType<typeof setTimeout> | null = null;

      const teardown = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        if (maxTimer) clearTimeout(maxTimer);
        try {
          if (node) {
            node.onaudioprocess = null;
            node.disconnect();
          }
        } catch {
          /* ignore */
        }
        try {
          source?.disconnect();
          sink?.disconnect();
        } catch {
          /* ignore */
        }
        try {
          recognizer?.remove();
        } catch {
          /* ignore */
        }
        try {
          stream?.getTracks().forEach((t) => t.stop());
        } catch {
          /* ignore */
        }
        try {
          void ctx?.close();
        } catch {
          /* ignore */
        }
        this.teardownActive = null;
      };

      const finish = (transcript: string) => {
        if (settled) return;
        settled = true;
        teardown();
        resolve({ transcript, confidence: 0, heardSomething: heard });
      };
      this.teardownActive = () => finish(finalText);

      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate: 16000,
          },
        })
        .then((s) => {
          if (settled) {
            s.getTracks().forEach((t) => t.stop());
            return;
          }
          stream = s;
          ctx = new AudioContext();
          recognizer = new model.KaldiRecognizer(ctx.sampleRate);

          recognizer.on("result", (message) => {
            const text = (message as { result?: { text?: string } }).result?.text;
            if (text && text.trim()) {
              finalText = text.trim();
              finish(finalText);
            }
          });
          recognizer.on("partialresult", (message) => {
            const partial = (message as { result?: { partial?: string } }).result
              ?.partial;
            if (partial && partial.trim()) {
              if (!heard) {
                heard = true;
                opts.onSpeechStart?.();
              }
              // Once the child pauses, wrap up and fetch the final result.
              if (silenceTimer) clearTimeout(silenceTimer);
              silenceTimer = setTimeout(() => {
                try {
                  recognizer?.retrieveFinalResult();
                } catch {
                  /* ignore */
                }
              }, 1200);
            }
          });

          source = ctx.createMediaStreamSource(s);
          node = ctx.createScriptProcessor(4096, 1, 1);
          node.onaudioprocess = (event) => {
            try {
              recognizer?.acceptWaveform(event.inputBuffer);
            } catch {
              /* ignore a dropped frame */
            }
          };
          // Route through a muted gain node so the mic isn't echoed to speakers
          // (ScriptProcessor still needs a path to destination to run).
          sink = ctx.createGain();
          sink.gain.value = 0;
          source.connect(node);
          node.connect(sink);
          sink.connect(ctx.destination);

          maxTimer = setTimeout(() => {
            try {
              recognizer?.retrieveFinalResult();
            } catch {
              /* ignore */
            }
            // Give the worker a moment to emit the final result, else resolve.
            setTimeout(() => finish(finalText), 400);
          }, opts.timeoutMs ?? 7000);
        })
        .catch(() => finish("")); // permission denied / no mic
    });
  }

  abort(): void {
    this.teardownActive?.();
  }
}
