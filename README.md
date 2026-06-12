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

- **34 survival phrases** in 4 packs: Greetings, Eating, Playing, Feelings/Body.
- **Flashcards** — tap a picture, hear the German phrase (auto-plays too).
- **Listen & Tap game** — the app says a phrase; the child taps the right
  picture out of 3. Wrong taps are gentle (no score loss); right taps celebrate.
- **Parent mode** — behind a simple adult gate (a small sum). Switch language,
  show/hide German text, see progress, replay any phrase.
- **No accounts, no backend, no tracking.** Progress is stored only on the
  device (`localStorage`). Privacy-safe by default.

See [`docs/MVP_SPEC.md`](docs/MVP_SPEC.md) for the full product/architecture spec.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Open it on a phone/tablet on the same network to test with a real child.

Build for production:

```bash
npm run build && npm run start
```

---

## Audio & images: how content works

The app is **fully usable today with zero asset files**:

- **Audio** uses the browser's built-in **German speech synthesis**.
- **Images** use an **emoji placeholder** per phrase.

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
    phrases.ts             # The 34 phrases (authored once, multi-language)
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
