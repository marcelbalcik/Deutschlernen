# Exercise assets (images + sounds)

Each phrase/exercise has its own folder here, named exactly after the phrase
`id` from `src/data/phrases.ts`. Drop two files into it:

```
public/exercises/<phrase_id>/
  image.png      ← the flashcard illustration (square, ~512×512+)
  audio.mp3      ← a native-speaker recording of the German phrase
```

Example:

```
public/exercises/eating_dont_like_this/
  image.png
  audio.mp3
```

## How it works

- You only need to add the files — **no code or data changes.**
- A scan runs automatically before `npm run dev` and `npm run build` and
  records which exercises have assets. You can also run it manually:

  ```
  npm run assets
  ```

- Until a file exists, the app falls back automatically:
  - **image** → the phrase's emoji placeholder
  - **audio** → the browser's built-in German speech (text-to-speech)

So the app is always fully usable while you fill in real assets one exercise
at a time.

## The full list of phrase ids

Run `npm run assets` to see which ones already have assets, or open
`src/data/phrases.ts` for the complete list. The ids look like:
`greetings_hello`, `eating_dont_like_this`, `playing_share`,
`health_need_help`, etc.

## File requirements

- **image.png** — square, transparent or white background, simple preschool
  cartoon style (see the art direction in the project spec). Keep it small
  (ideally under ~200 KB) so it loads fast on tablets.
- **audio.mp3** — short, clear, friendly. One phrase per file. Mono is fine.

If you ever need a different filename or extension for one phrase, set
`imageAsset` / `audioAsset` on that phrase in `src/data/phrases.ts` to override
the convention.
