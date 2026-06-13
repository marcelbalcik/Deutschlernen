import { normalize, tokens } from "./normalize";

// Forgiving scorer: compares a child's spoken attempt (the recognizer's
// transcript) against the target German phrase. Designed to be generous — for
// very young learners the point is the attempt, not accuracy.
//
// Outcomes (there is NO "wrong"):
//   "great"   → celebrate + star
//   "close"   → warm encouragement, still rewarding ("Fast! Super!")
//   "again"   → gentle "didn't catch that, try again" (e.g. silence)

export type Outcome = "great" | "close" | "again";

export type Forgiveness = "high" | "normal";

export type ScoreResult = {
  outcome: Outcome;
  /** 0..1 similarity, useful for tuning/telemetry (not shown to children). */
  similarity: number;
  /** Fraction of target words that were matched. */
  coverage: number;
};

/** Levenshtein edit distance between two strings. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Similarity ratio in 0..1 (1 = identical). */
function ratio(a: string, b: string): number {
  if (!a && !b) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

/**
 * Score an attempt against the target phrase.
 *
 * @param target      the German phrase the child should say
 * @param transcript  whatever the recognizer heard (may be empty)
 * @param opts.heardSomething  true if the mic detected sound even if the
 *        transcript came back empty — lets us still encourage an attempt
 * @param opts.forgiveness  "high" (default) is extra lenient for the youngest
 */
export function scoreAttempt(
  target: string,
  transcript: string,
  opts: { heardSomething?: boolean; forgiveness?: Forgiveness } = {}
): ScoreResult {
  const forgiveness = opts.forgiveness ?? "high";
  const targetWords = tokens(target);
  const heardWords = tokens(transcript);

  // Nothing transcribed.
  if (heardWords.length === 0) {
    // If we at least detected a sound, treat it as a real attempt and nudge
    // up to "close" in high-forgiveness mode — never leave a child empty-handed.
    if (opts.heardSomething && forgiveness === "high") {
      return { outcome: "close", similarity: 0, coverage: 0 };
    }
    return { outcome: "again", similarity: 0, coverage: 0 };
  }

  // Word coverage: each target word counts as "matched" if any heard word is
  // similar enough (handles word order and partial phrases).
  let hits = 0;
  for (const tw of targetWords) {
    const best = Math.max(0, ...heardWords.map((hw) => ratio(tw, hw)));
    if (best >= 0.6) hits++;
  }
  const coverage = targetWords.length ? hits / targetWords.length : 0;

  // Whole-string similarity (catches close-but-mis-segmented attempts).
  const similarity = ratio(normalize(target), normalize(transcript));

  // Thresholds — deliberately low. "high" forgiveness lowers them further.
  const greatCov = forgiveness === "high" ? 0.5 : 0.6;
  const greatSim = forgiveness === "high" ? 0.55 : 0.7;
  const closeCov = forgiveness === "high" ? 0.01 : 0.34; // any word matched
  const closeSim = forgiveness === "high" ? 0.3 : 0.45;

  if (coverage >= greatCov || similarity >= greatSim) {
    return { outcome: "great", similarity, coverage };
  }
  if (coverage >= closeCov || similarity >= closeSim) {
    return { outcome: "close", similarity, coverage };
  }
  // They spoke real words but nothing matched — still an attempt: encourage.
  return {
    outcome: forgiveness === "high" ? "close" : "again",
    similarity,
    coverage,
  };
}
