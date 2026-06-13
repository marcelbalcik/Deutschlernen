# Deploy to GitHub Pages

The app builds to a fully static site (no server), so GitHub Pages can host it
for free. Everything client-side — flashcards, the Listen & Tap game, and
speak-and-repeat via the browser's speech recognizer — works with zero extra
setup.

## 1. One-time setup

1. In the repo: **Settings → Pages → Build and deployment → Source:
   "GitHub Actions"**.
2. Make sure `.github/workflows/deploy-pages.yml` is on your default branch
   (`main`).

## 2. Deploy

Push to `main` (or run the workflow manually from the **Actions** tab). The
workflow builds the static site and publishes it to:

```
https://<your-username>.github.io/<repo-name>/
```

The site is served under the `/<repo-name>/` subpath. The workflow sets
`NEXT_PUBLIC_BASE_PATH=/<repo-name>` automatically so all assets and links
resolve correctly.

> **User/org page or custom domain?** If you deploy to `<user>.github.io` (root)
> or use a custom domain, set `NEXT_PUBLIC_BASE_PATH` to an empty string in the
> workflow.

## 3. (Optional) Cloud sync + Google login

`NEXT_PUBLIC_*` values are baked in at build time, so add them as **Actions
secrets** (Settings → Secrets and variables → Actions):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then, in Supabase (**Authentication → URL Configuration**), add your Pages URL
to **Site URL** and **Redirect URLs**, including the subpath:

```
https://<user>.github.io/<repo>/parent/
```

See [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) for the full provider setup.

## 4. (Optional) On-device Vosk speech model

The ~45 MB model is **not** committed to git, so it isn't deployed by default.
Two options:

- **Host it on a CDN** (or any HTTPS URL with CORS enabled) and add an Actions
  **variable** `NEXT_PUBLIC_VOSK_MODEL_URL` pointing at the `.tar.gz`.
- **Or skip it** — the "Private" speech option then falls back to the browser
  recognizer automatically.

(Committing a 45 MB binary to the repo also works but bloats it; a CDN is
cleaner.)

## Notes & limitations

- **Routing:** every screen is pre-rendered to its own `index.html`, so deep
  links and refreshes work. Unknown URLs serve the static `404.html`.
- **HTTPS:** Pages serves over HTTPS, which the microphone and Google OAuth
  both require — good.
- **Vercel/Netlify alternative:** these host the app at the domain root, so you
  don't need `BASE_PATH` at all — just connect the repo and (optionally) set the
  Supabase env vars.
