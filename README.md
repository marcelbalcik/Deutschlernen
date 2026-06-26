# Kita-Sprache 🐻

A visual, audio-first phrase app that helps **young children (≈2.5–6)** speak up
in **Kita / kindergarten** in a new language. The first language is **German**,
with parent translations in **English** and **Turkish**.

It is built for children who **may not read yet**: every phrase is a picture +
sound, learned through tapping and repetition — not text or grammar.

> Guiding question for every phrase: *"Would this help a child tomorrow morning
> in Kita?"*

---

## What's in this MVP

- **216 phrases** in 4 packs: Greetings (54), Eating (52), Playing (52),
  Feelings/Body (58). The 31 most critical ones are flagged `priority` and
  surface together in a virtual **Survival** pack for day-one Kita needs.
- **Flashcards** — tap a picture, hear the German phrase (auto-plays too).
- **Listen & Tap game** — the app says a phrase; the child taps the right
  picture out of 3. Wrong taps are gentle (no score loss); right taps celebrate.
- **Parent mode** — behind a simple adult gate (a small sum). Switch language,
  show/hide German text, choose speech backend, see progress, replay any phrase.
- **Speak & repeat** — a forgiving "say it back" mic on every phrase. Backend is
  pluggable: Web Speech (fast) or on-device Vosk (private/offline).
- **Local-first by default.** Progress is stored on the device (`localStorage`),
  no account required. **Optional** Google sign-in (parent only) backs progress
  up to the cloud and syncs across devices — see
  [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md). Disabled until configured.

See [`docs/MVP_SPEC.md`](docs/MVP_SPEC.md) for the full product/architecture spec.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Open it on a phone/tablet on the same network to test with a real child.

Build for production (server/Vercel):

```bash
npm run build && npm run start
```

## Deploy free to GitHub Pages (fully static, no server)

The app exports to a 100% static site, so it runs on GitHub Pages with no
backend. A workflow (`.github/workflows/deploy-pages.yml`) does it on every push
to `main`:

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. Push to `main`. The site publishes at
   `https://<user>.github.io/<repo>/`.

That's it for the core app (flashcards, game, speak-and-repeat via browser
speech). Two optional extras need a little more — see
[`docs/DEPLOY_GITHUB_PAGES.md`](docs/DEPLOY_GITHUB_PAGES.md):

- **Cloud sync / Google login:** add `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Actions secrets, and add the Pages URL to
  Supabase's redirect list.
- **On-device Vosk model:** the ~45 MB model isn't committed; host it on a CDN
  and set the `NEXT_PUBLIC_VOSK_MODEL_URL` Actions variable. Without it, voice
  practice still works via the browser recognizer.

To build the static site locally:

```bash
BUILD_TARGET=pages NEXT_PUBLIC_BASE_PATH="" npm run build:pages   # output in ./out
```

---

## Audio & images: how content works

The app is **fully usable today with zero asset files**:

- **Audio** uses the browser's built-in **German speech synthesis**.
- **Images** use an **emoji placeholder** per phrase.

> **Heads up on browser speech (Linux):** Web Speech synthesis only produces
> sound if the operating system has German TTS voices installed. macOS and
> Windows ship them by default, but a fresh Linux/Ubuntu browser has **none** —
> `speechSynthesis.getVoices()` returns an empty list and nothing plays. Install
> `speech-dispatcher` + `espeak-ng` for a (robotic) fallback, or add real
> recordings (below) so the app no longer depends on browser speech.

To add real assets, drop two files into a folder named after the phrase `id`:

```
public/exercises/<phrase_id>/
  image.png      ← flashcard illustration (square)
  audio.mp3      ← native-speaker recording
```

That's it — no code changes. A scan runs automatically on `dev`/`build` (or run
`npm run assets`) and the app starts using the real files, falling back to
emoji/speech for anything not yet added. Details:
[`public/exercises/README.md`](public/exercises/README.md).

**Generating audio in bulk.** Rather than recording all 216 phrases by hand, you
can synthesize them with a local TTS engine. `scripts/generate-voices.py` reads
`src/data/phrase_packs.json` and writes one `audio.mp3` per phrase into the
folders above. See [`docs/VOICE_GENERATION.md`](docs/VOICE_GENERATION.md) for
setup, voice-model choices, and commercial-licensing notes.

---

## Project structure

```
src/
  app/                     # Next.js App Router screens
    page.tsx               #   Home / category select (child)
    learn/[category]/      #   Flashcard deck
    play/[category]/       #   Listen & Tap game
    parent/                #   Parent mode (gated)
    globals.css
  components/              # Flashcard, AudioButton, ChoiceCard, ProgressDots, ...
  data/
    phrase_packs.json      # Source of truth: the 216 phrases (multi-language)
    phrases.ts             # Loads + shapes phrase_packs.json into app content
    categories.ts
    assets.generated.json  # Auto-generated asset manifest (do not edit by hand)
  lib/
    audio.ts               # Speech synthesis + recorded-audio playback
    progress.ts            # localStorage progress (seen / correct / favorites)
    settings.ts            # Parent settings (source language, show text)
    assets.ts              # Per-exercise asset paths + manifest helpers
  types/
    phrase.ts              # Content types
public/
  exercises/<id>/          # image.png + audio.mp3 per phrase (you add these)
scripts/
  scan-assets.mjs          # Builds the asset manifest
  generate-voices.py       # Bulk-synthesizes German audio.mp3 per phrase (TTS)
```

---

## Tech choices (and why)

- **Next.js (web-first), not native yet.** Deploys to a URL you can open on any
  tablet *today* — no App Store. Validate the format with real kids first, then
  port to React Native/Expo if needed.
- **No backend.** Static content + local progress. Cheapest, safest, fastest.
- **Speech synthesis for MVP audio.** No recording pipeline to block testing;
  swap in real recordings per-phrase whenever you're ready.
- **Dependency-light.** Only Next + React. No UI kit, no state library.

## Roadmap / not in MVP (on purpose)

Speech recognition, coins/avatars/leaderboards, social features, teacher
dashboards, accounts, cloud sync, extra languages, grammar progression. Add only
after children demonstrably engage with this core loop.
