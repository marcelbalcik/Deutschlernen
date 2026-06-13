import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Single shared Supabase client, created lazily on the client side only.
//
// Cloud sync is OPTIONAL: if the two public env vars aren't set, getSupabase()
// returns null and the whole app keeps working in local-only mode. This keeps
// the "local-first, cloud-optional" guarantee — login never becomes a hard
// dependency.
//
// The anon key is meant to be public; data is protected by Row Level Security
// (see docs/SUPABASE_SETUP.md), so a signed-in parent can only ever read/write
// their own progress row.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null | undefined;

/** Returns the Supabase client, or null if cloud sync isn't configured. */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (typeof window === "undefined" || !url || !anonKey) {
    client = null;
    return client;
  }
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // handle the OAuth redirect, no server route needed
    },
  });
  return client;
}

/** True if the backend env vars are present (independent of being signed in). */
export function isCloudConfigured(): boolean {
  return !!url && !!anonKey;
}
