// Simple, privacy-safe progress tracking. Everything lives in localStorage on
// the child's device — no accounts, no backend, no data leaves the device.
// This is intentional for a children's app MVP (GDPR-K / COPPA friendly).

const SEEN_KEY = "kita_seen_phrases_v1";
const CORRECT_KEY = "kita_correct_phrases_v1";
const FAVORITES_KEY = "kita_favorite_phrases_v1";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // Storage may be full or disabled; progress is non-critical, so ignore.
  }
}

/** Mark a phrase as having been viewed at least once. */
export function markSeen(id: string): void {
  const set = readSet(SEEN_KEY);
  set.add(id);
  writeSet(SEEN_KEY, set);
}

/** Mark a phrase as answered correctly in the Listen & Tap game. */
export function markCorrect(id: string): void {
  const set = readSet(CORRECT_KEY);
  set.add(id);
  writeSet(CORRECT_KEY, set);
}

export function getSeen(): Set<string> {
  return readSet(SEEN_KEY);
}

export function getCorrect(): Set<string> {
  return readSet(CORRECT_KEY);
}

export function isFavorite(id: string): boolean {
  return readSet(FAVORITES_KEY).has(id);
}

export function toggleFavorite(id: string): boolean {
  const set = readSet(FAVORITES_KEY);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  writeSet(FAVORITES_KEY, set);
  return set.has(id);
}

export function getFavorites(): Set<string> {
  return readSet(FAVORITES_KEY);
}

/** Wipe all locally stored progress (offered in parent mode). */
export function resetProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SEEN_KEY);
  window.localStorage.removeItem(CORRECT_KEY);
  window.localStorage.removeItem(FAVORITES_KEY);
}
