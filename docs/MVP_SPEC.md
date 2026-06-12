# Kita-Sprache — MVP Specification

Status: **MVP implemented** (this repository). This document is the product +
architecture spec the code is built against.

---

## 1. Problem & target user

Young immigrant/relocated children (≈2.5–6) entering Kita/kindergarten in a
country whose language they don't yet speak. Many **can't read** and may barely
speak. They need **immediate communication safety**: "What can I say in this
situation?" — not grammar.

- **Primary user:** the child (pre-literate, tap-based, audio + image first).
- **Secondary user:** the parent/caregiver (sets language, checks progress).

First target language: **German**. Parent languages: **English**, **Turkish**.

## 2. Learning philosophy

Each item = **situation + phrase + emotion + action**. Recognition before
production. Repetition without pressure. No punishment for mistakes. Audio-first,
visual-first, minimal text.

## 3. Scope

**In MVP**

1. Flashcards (image + audio + optional German text + parent translation).
2. Listen & Tap game (hear phrase → tap correct image of 3).
3. Parent mode (gated): language, show/hide text, progress, replay.
4. Offline-friendly, local-only progress.

**Deliberately NOT in MVP:** speech recognition/scoring, heavy gamification,
avatars/coins/shops/leaderboards, social features, teacher dashboards, accounts,
cloud sync, many languages, grammar progression, real-time multiplayer, UGC.

## 4. The 34 phrases

Natural, short, Kita-appropriate German. Four packs:

**Greetings (9):** Hallo · Tschüss · Bitte · Danke · Entschuldigung · Ja · Nein ·
Ich verstehe das nicht · Kannst du mir helfen?

**Eating (9):** Ich habe Hunger · Ich habe Durst · Ich möchte Wasser · Das mag
ich · Das mag ich nicht · Ich bin satt · Ich möchte mehr · Das ist heiß · Das
schmeckt gut

**Playing (8):** Darf ich mitspielen? · Komm, wir spielen zusammen · Ich bin
dran · Du bist dran · Bitte gib mir das zurück · Stopp, das mag ich nicht ·
Nicht schubsen · Wir können teilen

**Feelings / body / health (8):** Mein Bauch tut weh · Mein Kopf tut weh · Ich
muss auf die Toilette · Ich bin müde · Mir ist kalt · Ich habe Angst · Ich möchte
nach Hause · Ich brauche Hilfe

Source of truth: `src/data/phrases.ts`.

## 5. Data model

Authored once as `PhraseContent` (German + emoji + situation + a translations
map), resolved at runtime into the spec's `PhraseItem` for the chosen parent
language. See `src/types/phrase.ts`. Adding a language = add a key to
`translations` + extend `SourceLanguage`; no UI changes.

```ts
type PhraseItem = {
  id: string;
  category: "greetings" | "eating" | "playing" | "health" | "kita";
  targetLanguage: "de";
  sourceLanguage: "en" | "tr";
  phraseTarget: string;     // German
  phraseSource: string;     // parent translation
  childContext: string;
  situationDescription: string;
  emotion: string;
  emoji: string;            // placeholder visual
  imageAsset?: string;      // real illustration (optional override)
  audioAsset?: string;      // real recording (optional override)
  difficulty: 1 | 2 | 3;
  tags: string[];
};
```

### Assets (per-exercise folders)

Each phrase has a folder `public/exercises/<id>/` holding `image.png` +
`audio.mp3`. A build-time scan (`scripts/scan-assets.mjs`) writes
`src/data/assets.generated.json`; the app reads it to decide — synchronously,
inside the tap (required for iOS audio) — whether to use a real file or fall
back to emoji / German speech synthesis.

## 6. Screens & flows

| Screen | Route | Who | Notes |
|---|---|---|---|
| Home / category select | `/` | Child | 4 big picture tiles; small gated parent corner |
| Flashcards | `/learn/[category]` | Child | Auto-plays audio; tap card to replay; Next/Back; last card → game |
| Listen & Tap | `/play/[category]` | Child | Hear phrase → tap 1 of 3 images; gentle on wrong; celebrate on right |
| Parent mode | `/parent` | Parent | Adult sum gate → settings + progress + phrase list |

**Child flow:** Home → pick pack → swipe through flashcards → play the game →
celebrate → back home.

**Parent flow:** Home → corner button → solve sum → set language / toggle text /
view progress / replay phrases / reset progress.

## 7. UX principles applied

Big buttons, minimal text, few choices per screen, clear feedback, no
punishment, audio-first, no ads/IAP/dark patterns. Parent area gated so children
don't wander into settings.

## 8. Tech stack

- **Next.js (App Router) + TypeScript**, web-first for instant tablet testing.
- **No backend.** Static content; progress in `localStorage`.
- **No UI/state libraries.** Plain CSS, React state only. Dependency-light.
- **Audio:** Web Speech API (`de-DE`) now; per-phrase recordings later.

Rationale: fastest, cheapest, safest path to testing with real children. Port to
React Native/Expo only after the core loop is validated.

## 9. Privacy & safety

No accounts, no analytics, no child voice capture, no ads, no social. All data
stays on-device. This keeps the MVP aligned with GDPR-K / COPPA expectations.
Revisit consent/compliance only if/when cloud features are introduced.

## 10. Milestones

- **M0 — Scaffold & content (done):** types, 34 phrases (en/tr), categories.
- **M1 — Core loop (done):** flashcards + Listen & Tap + audio + progress.
- **M2 — Parent mode (done):** gate, settings, progress, phrase list.
- **M3 — Real assets:** drop in illustrations + native-speaker recordings,
  one exercise folder at a time.
- **M4 — Field test:** deploy URL, test with a handful of children/parents,
  observe engagement and which phrases get used.
- **M5 — Iterate:** adjust phrases/visuals; consider offline PWA install.
- **Later (only if validated):** more languages, more packs, React Native port.

## 11. What to build first in code (already done here)

1. `types/phrase.ts` + `data/phrases.ts` (content is the product).
2. `lib/audio.ts`, `lib/progress.ts`, `lib/settings.ts`, `lib/assets.ts`.
3. Components: Flashcard, AudioButton, ChoiceCard, ProgressDots, PhraseVisual.
4. Screens: home, learn, play, parent.

Next practical step for the owner: **field-test the deployed URL with one child**
and start filling in `public/exercises/<id>/` assets for the highest-value
phrases (toilet, help, hungry, hurt).
