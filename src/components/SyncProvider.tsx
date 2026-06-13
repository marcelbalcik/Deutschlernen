"use client";

import { useEffect } from "react";
import { isCloudConfigured } from "@/lib/supabase/client";
import { getCurrentSession, onAuthChange } from "@/lib/supabase/auth";
import { startSyncForUser, stopSync } from "@/lib/supabase/sync";

/**
 * Invisible, app-wide controller that keeps cloud sync running whenever a
 * parent is signed in — so a child's progress keeps saving even while they play,
 * not just on the parent screen. No-op when cloud sync isn't configured.
 */
export default function SyncProvider() {
  useEffect(() => {
    if (!isCloudConfigured()) return;

    let cancelled = false;
    getCurrentSession().then((session) => {
      if (!cancelled && session?.user) void startSyncForUser(session.user.id);
    });

    const unsub = onAuthChange((session) => {
      if (session?.user) void startSyncForUser(session.user.id);
      else stopSync();
    });

    return () => {
      cancelled = true;
      unsub();
      stopSync();
    };
  }, []);

  return null;
}
