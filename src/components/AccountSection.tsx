"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/useAuth";
import { signInWithGoogle, signOut } from "@/lib/supabase/auth";
import { deleteCloudData } from "@/lib/supabase/sync";

/**
 * Account / cloud-backup controls shown inside the (gated) parent area.
 * The PARENT signs in with Google to back up and sync the child's progress
 * across devices. Entirely optional — hidden gracefully when not configured.
 */
export default function AccountSection() {
  const { session, ready, configured } = useAuth();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!configured) {
    return (
      <div className="parent-section">
        <h3>Account &amp; backup</h3>
        <p className="muted-note" style={{ textAlign: "left", margin: 0 }}>
          Cloud backup isn&apos;t set up yet. Progress is saved on this device
          only. To enable Google sign-in and cross-device sync, see{" "}
          <code>docs/SUPABASE_SETUP.md</code>.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="parent-section">
        <h3>Account &amp; backup</h3>
        <p className="muted-note" style={{ margin: 0 }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="parent-section">
        <h3>Account &amp; backup</h3>
        <p className="muted-note" style={{ textAlign: "left", marginTop: 0 }}>
          Sign in to save your child&apos;s progress and sync it across devices.
          This is for grown-ups — we only use your email to store progress.
        </p>
        <button
          className="link-btn"
          style={{ width: "100%" }}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await signInWithGoogle("/parent");
          }}
        >
          {busy ? "…" : "Sign in with Google"}
        </button>
      </div>
    );
  }

  const email = session.user.email ?? "your account";

  return (
    <div className="parent-section">
      <h3>Account &amp; backup</h3>
      <div className="parent-row">
        <span>Signed in</span>
        <strong style={{ fontSize: 14, wordBreak: "break-all" }}>{email}</strong>
      </div>
      <p className="muted-note" style={{ textAlign: "left", marginTop: 2 }}>
        ✅ Progress is being saved to your account and synced across devices.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
        <button
          className="danger-btn"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await signOut();
            setBusy(false);
          }}
        >
          Sign out
        </button>

        {!confirmDelete ? (
          <button
            className="danger-btn"
            onClick={() => setConfirmDelete(true)}
          >
            Delete saved data
          </button>
        ) : (
          <button
            className="danger-btn"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await deleteCloudData(session.user.id);
              setConfirmDelete(false);
              setBusy(false);
            }}
          >
            Tap again to confirm delete
          </button>
        )}
      </div>
    </div>
  );
}
