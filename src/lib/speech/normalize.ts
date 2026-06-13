// Text normalization for forgiving German phrase matching.
//
// The goal is to make a child's imperfect attempt match the target as often as
// reasonably possible: case, punctuation, umlauts and small spelling slips
// should never cause a "wrong".

const FILLER = new Set(["ah", "ahm", "aeh", "aehm", "em", "hm", "uh", "und"]);

/**
 * Lowercase, fold umlauts (ä→ae, ö→oe, ü→ue, ß→ss), strip punctuation, and
 * collapse whitespace. Umlaut folding matters because recognizers and children
 * often drop the umlaut ("mude" for "müde").
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip any remaining accents
    .replace(/[^\p{Letter}\s]/gu, " ") // drop punctuation/digits
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalized, filler-free word tokens. */
export function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 0 && !FILLER.has(w));
}
