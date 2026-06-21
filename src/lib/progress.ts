// Progress tracking. localStorage is always the source of truth (works offline,
// no account needed). When a parent signs in, the sync layer mirrors this to
// the cloud — but nothing here depends on the cloud.

const SEEN_KEY = "kita_seen_phrases_v1";
const CORRECT_KEY = "kita_correct_phrases_v1";
const SPOKEN_KEY = "kita_spoken_phrases_v1";
const FAVORITES_KEY = "kita_favorite_phrases_v1";
const STAR_TOTAL_KEY = "kita_star_total_v1";

/** Running total of stars the child has caught/collected. */
export function getStarTotal(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(STAR_TOTAL_KEY)) || 0;
}

/** Add to the collected-star total; returns the new total. */
export function addStars(n: number): number {
  const total = getStarTotal() + n;
  try {
    window.localStorage.setItem(STAR_TOTAL_KEY, String(total));
  } catch {
    /* ignore */
  }
  notify();
  return total;
}

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
  notify();
}

// --- Change notifications (used by the cloud-sync layer to push updates) ---

type Listener = () => void;
const listeners = new Set<Listener>();

/** Subscribe to any progress change. Returns an unsubscribe function. */
export function subscribeProgress(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(): void {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      /* a listener error must not break progress writes */
    }
  });
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

/** Mark a phrase as having been spoken/attempted aloud in Repeat mode. */
export function markSpoken(id: string): void {
  const set = readSet(SPOKEN_KEY);
  set.add(id);
  writeSet(SPOKEN_KEY, set);
}

export function getSeen(): Set<string> {
  return readSet(SEEN_KEY);
}

export function getCorrect(): Set<string> {
  return readSet(CORRECT_KEY);
}

export function getSpoken(): Set<string> {
  return readSet(SPOKEN_KEY);
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

// --- Snapshot / merge (the shape stored in the cloud) ---

export type ProgressSnapshot = {
  seen: string[];
  correct: string[];
  spoken: string[];
  favorites: string[];
};

export function getProgressSnapshot(): ProgressSnapshot {
  return {
    seen: [...readSet(SEEN_KEY)],
    correct: [...readSet(CORRECT_KEY)],
    spoken: [...readSet(SPOKEN_KEY)],
    favorites: [...readSet(FAVORITES_KEY)],
  };
}

/**
 * Merge a snapshot (e.g. from the cloud) INTO local progress by union. Union
 * means multi-device progress combines additively and we never lose a phrase a
 * child already practiced on another device.
 */
export function applyProgressSnapshot(snap: Partial<ProgressSnapshot>): void {
  const merge = (key: string, incoming?: string[]) => {
    if (!incoming || incoming.length === 0) return;
    const set = readSet(key);
    let changed = false;
    for (const id of incoming) {
      if (!set.has(id)) {
        set.add(id);
        changed = true;
      }
    }
    if (changed) writeSet(key, set);
  };
  merge(SEEN_KEY, snap.seen);
  merge(CORRECT_KEY, snap.correct);
  merge(SPOKEN_KEY, snap.spoken);
  merge(FAVORITES_KEY, snap.favorites);
}

/** Wipe all locally stored progress (offered in parent mode). */
export function resetProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SEEN_KEY);
  window.localStorage.removeItem(CORRECT_KEY);
  window.localStorage.removeItem(SPOKEN_KEY);
  window.localStorage.removeItem(FAVORITES_KEY);
  window.localStorage.removeItem(STAR_TOTAL_KEY);
  notify();
}
