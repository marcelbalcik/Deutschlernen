// A backend-agnostic speech recognizer interface. The UI talks ONLY to this,
// so we can swap the Web Speech API for on-device ASR (Vosk) or a native
// Capacitor plugin later — for the offline/private APK — without UI changes.

export type RecognitionResult = {
  /** Best-guess text of what was said (may be empty). */
  transcript: string;
  /** Recognizer confidence 0..1 if available (often unreliable for children). */
  confidence: number;
  /** True if the mic picked up sound, even when transcript is empty. */
  heardSomething: boolean;
};

export interface SpeechRecognizer {
  /** Whether this backend can run in the current environment. */
  isSupported(): boolean;
  /**
   * Optional one-time initialisation (e.g. downloading an on-device model).
   * Returns true if the backend is ready to use. Backends with nothing to
   * prepare may omit this.
   */
  prepare?(): Promise<boolean>;
  /**
   * Listen for a single short utterance and resolve with the result.
   * Resolves (never rejects) on no-speech/timeout so the UI stays simple.
   * @param onSpeechStart called when sound is first detected (for UI feedback)
   */
  listenOnce(opts: {
    lang: string;
    onSpeechStart?: () => void;
    timeoutMs?: number;
  }): Promise<RecognitionResult>;
  /** Stop any in-progress recognition. */
  abort(): void;
}
