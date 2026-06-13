import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "./client";
import { withBasePath } from "@/lib/basePath";

// Auth helpers. The PARENT signs in with Google (behind the parent gate);
// children never authenticate. All calls are safe no-ops when cloud sync isn't
// configured.

/** Start the Google OAuth flow, returning to the parent area afterwards. */
export async function signInWithGoogle(redirectPath = "/parent"): Promise<void> {
  const sb = getSupabase();
  if (!sb || typeof window === "undefined") return;
  await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${withBasePath(redirectPath)}`,
    },
  });
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

export async function getCurrentSession(): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

/** Subscribe to sign-in/out changes. Returns an unsubscribe function. */
export function onAuthChange(cb: (session: Session | null) => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
