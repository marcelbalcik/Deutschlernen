import { getSupabase } from "./client";
import {
  applyProgressSnapshot,
  getProgressSnapshot,
  subscribeProgress,
  type ProgressSnapshot,
} from "@/lib/progress";

// Cloud sync for a signed-in parent. Strategy:
//  - On sign-in: PULL the cloud row and merge it into local (union), then PUSH
//    the merged result back so the cloud also gains any local-only progress.
//  - On any later local change: debounced PUSH.
// localStorage stays the source of truth; the cloud is a mirror/backup.

const TABLE = "progress";
const PUSH_DEBOUNCE_MS = 1500;

let currentUserId: string | null = null;
let unsubscribeProgress: (() => void) | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let lastSyncedAt: number | null = null;

export function getLastSyncedAt(): number | null {
  return lastSyncedAt;
}

async function pull(userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data, error } = await sb
    .from(TABLE)
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return;
  if (data?.data) applyProgressSnapshot(data.data as ProgressSnapshot);
}

async function push(userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const snapshot = getProgressSnapshot();
  const { error } = await sb
    .from(TABLE)
    .upsert(
      { user_id: userId, data: snapshot, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  if (!error) lastSyncedAt = Date.now();
}

function schedulePush(): void {
  if (!currentUserId) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    if (currentUserId) void push(currentUserId);
  }, PUSH_DEBOUNCE_MS);
}

/** Begin syncing for a signed-in user: merge cloud↔local, then watch changes. */
export async function startSyncForUser(userId: string): Promise<void> {
  currentUserId = userId;
  await pull(userId);
  await push(userId); // write the merged result back to the cloud
  if (!unsubscribeProgress) {
    unsubscribeProgress = subscribeProgress(schedulePush);
  }
}

/** Stop syncing (on sign-out). Local progress is untouched. */
export function stopSync(): void {
  currentUserId = null;
  if (unsubscribeProgress) {
    unsubscribeProgress();
    unsubscribeProgress = null;
  }
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
}

/** Delete this user's cloud row (GDPR: lets a parent erase saved data). */
export async function deleteCloudData(userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from(TABLE).delete().eq("user_id", userId);
  lastSyncedAt = null;
}
