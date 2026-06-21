// Playful sound effects, synthesized in the browser with the Web Audio API —
// no audio files needed. Cheerful chiptune-style cues that make the app feel
// alive and rewarding for young children.
//
// The AudioContext is created lazily and resumed on use; since these fire from
// taps (user gestures) they're allowed to play on mobile.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = "triangle",
  gain = 0.22
): void {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + startOffset;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

/** Bright ascending arpeggio — a correct answer. */
export function sfxCorrect(): void {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone(f, i * 0.09, 0.2, "triangle", 0.26)
  );
}

/** Happy little fanfare — finishing a game/story. */
export function sfxWin(): void {
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
    tone(f, i * 0.12, 0.32, "triangle", 0.28)
  );
  tone(1046.5, 0.62, 0.5, "triangle", 0.22);
}

/** Soft, friendly "not quite" — never harsh. */
export function sfxWrong(): void {
  tone(392, 0, 0.16, "sine", 0.16);
  tone(311, 0.12, 0.22, "sine", 0.14);
}

/** A light pop for taps (cause-and-effect delight). */
export function sfxTap(): void {
  tone(880, 0, 0.06, "square", 0.07);
}

/** A twinkle for earning a star. */
export function sfxStar(): void {
  tone(1318.5, 0, 0.12, "triangle", 0.2);
  tone(1760, 0.08, 0.14, "triangle", 0.18);
}
