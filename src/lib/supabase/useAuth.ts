"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getCurrentSession, onAuthChange } from "./auth";
import { isCloudConfigured } from "./client";

/** React hook exposing the current parent session and whether cloud is set up. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const configured = isCloudConfigured();

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    let active = true;
    getCurrentSession().then((s) => {
      if (active) {
        setSession(s);
        setReady(true);
      }
    });
    const unsub = onAuthChange((s) => setSession(s));
    return () => {
      active = false;
      unsub();
    };
  }, [configured]);

  return { session, ready, configured };
}
