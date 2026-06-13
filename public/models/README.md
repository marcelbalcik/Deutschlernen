# On-device speech model (Vosk)

The **Private** speech-recognition option runs entirely in the browser using
[`vosk-browser`](https://github.com/ccoreilly/vosk-browser) — the microphone
audio never leaves the device. It needs a German model file placed here:

```
public/models/vosk-model-small-de.tar.gz
```

The model is **not** committed to git (it's ~45 MB). Add it yourself.

## How to get the model

1. Download the small German model (~45 MB) from Alphacephei:
   <https://alphacephei.com/vosk/models> → `vosk-model-small-de-0.15.zip`

2. `vosk-browser` loads a **`.tar.gz`** (not a zip). Repackage it:

   ```bash
   unzip vosk-model-small-de-0.15.zip
   tar -czf vosk-model-small-de.tar.gz -C vosk-model-small-de-0.15 .
   ```

   The archive's top level must contain the model files directly
   (`am/`, `conf/`, `graph/`, ...), which is what `-C <dir> .` produces.

3. Move it here:

   ```bash
   mv vosk-model-small-de.tar.gz public/models/
   ```

4. In the app: **Parent area → Settings → Speech recognition → Private.**

## Custom location / CDN

Point the app at a different URL with an env var (e.g. in `.env.local`):

```
NEXT_PUBLIC_VOSK_MODEL_URL=https://your-cdn.example.com/vosk-model-small-de.tar.gz
```

If you host it cross-origin, make sure CORS allows it — the model loads inside a
Web Worker.

## Notes

- First load downloads + unpacks the model (a few seconds); afterwards the
  browser caches it.
- Accuracy on very young children is limited — but the app's matching is
  deliberately forgiving, so attempts are still rewarded.
- If the file is missing, the app silently falls back to the **Fast** (Web
  Speech) recognizer, so nothing breaks.
