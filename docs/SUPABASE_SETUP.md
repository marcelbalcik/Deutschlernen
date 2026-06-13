# Cloud sync setup (Supabase + Google login)

This enables a **parent** to sign in with Google and have the child's progress
saved and synced across devices. It's **optional** — without it, the app runs
fully local/offline and nothing breaks.

> Privacy note: turning this on means you collect a parent's email and store
> progress in the cloud. Before any real launch you'll want a short privacy
> policy and to honour data-deletion requests. The app already lets a parent
> delete their saved data (Parent area → Account → "Delete saved data"), and
> only the parent ever signs in — never the child.

## 1. Create a Supabase project

1. Sign up at <https://supabase.com> and create a new project (free tier is fine).
2. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Add the database table

Open **SQL Editor → New query**, paste the contents of
[`supabase/schema.sql`](../supabase/schema.sql), and run it. This creates the
`progress` table with Row Level Security so each parent can only access their
own data.

## 3. Enable Google sign-in

1. In Supabase: **Authentication → Providers → Google → enable**.
2. Create OAuth credentials in Google Cloud Console
   (<https://console.cloud.google.com> → APIs & Services → Credentials →
   "OAuth client ID" → Web application).
3. In the Google OAuth client, add the **Authorized redirect URI** that Supabase
   shows you on the Google provider page (it looks like
   `https://<your-project>.supabase.co/auth/v1/callback`).
4. Paste the Google **Client ID** and **Client secret** back into Supabase and
   save.
5. In Supabase **Authentication → URL Configuration**, add your app's URLs
   (e.g. `http://localhost:3000` for dev and your deployed URL) to **Site URL**
   / **Redirect URLs**.

## 4. Add the environment variables

Copy `.env.local.example` to `.env.local` and fill in the two values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Restart `npm run dev`. The **Parent area → Account & backup** section will now
show "Sign in with Google".

## How sync works

- `localStorage` is always the source of truth (offline-first).
- On sign-in, the app merges the cloud row into local progress (union — nothing
  is lost), then writes the merged result back.
- After that, local changes are pushed to the cloud (debounced).
- Sign-out stops syncing but leaves local progress intact.

## Deploying

Set the same two env vars in your host (e.g. Vercel → Project → Settings →
Environment Variables), and add the deployed URL to Supabase's redirect URLs.
Because auth + data run entirely client-side, the app still needs **no server
routes** — the static/APK path is preserved.
