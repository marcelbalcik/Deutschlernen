# Exercise images

Flashcard images live here, one per phrase, named after the phrase id:

```
public/exercises/_raw/<phrase_id>.png      e.g. greetings_001.png
```

The phrase ids and their text come from `src/data/phrase_packs.json`, which is
the content source of truth. The app maps each phrase to `<id>.png` here
automatically — no code changes when you replace or add an image.

Images are optimized (resized to ~512 px, compressed) by
`node scripts/optimize-raw-images.mjs`. If you drop in new full-size images,
re-run that script to keep them small.
