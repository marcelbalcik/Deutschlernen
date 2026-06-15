# Story narration images

One image per story narration beat, named after its id:

```
public/stories/_raw/<story_id>_n<k>.png      e.g. first_day_n1.png
```

`<story_id>` is the story's id and `n<k>` is the k-th narration beat (1..6).
See docs/story_scenes_to_illustrate.csv for the full list + scene text.

Until an image exists, the app shows the narration's emoji. Drop a file in and
it's used automatically (run `node scripts/optimize-raw-images.mjs`-style sizing
or keep them ~512px). No code changes needed.
