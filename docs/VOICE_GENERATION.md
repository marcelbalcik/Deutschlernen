# Generating the spoken audio (Piper TTS)

This produces a recorded-quality voice for every phrase so the app stops relying
on the browser's robotic speech. Output is named/placed for the app's audio
convention automatically by `scripts/generate-voices.py`:

```
public/exercises/<id>/audio.mp3      German  (text.de) — the phrase the child learns
public/exercises/<id>/audio.en.mp3   English (text.en) — optional translation audio
public/exercises/<id>/audio.tr.mp3   Turkish (text.tr) — optional translation audio
```

The app already prefers these files when present and falls back to TTS otherwise.

## Why Piper (not "Voicebox")

Meta's **Voicebox is not publicly released** (no weights/code). **Piper** is the
practical choice here:

- Native **German / English / Turkish** voices.
- **Commercial-safe** voices exist — the German **Thorsten** voice is **CC0**.
- Fast on CPU; a Tesla GPU is optional (each phrase is < 1s). All ~216 German
  clips generate in a few minutes.

> Coqui **XTTS-v2** gives a warmer, cloneable voice and uses the GPU well, but
> its license is **non-commercial (CPML)** — fine for prototypes, not for a paid
> release. Stick to Piper/CC0 voices for anything you ship.

## 0. Check the GPU (optional for Piper)

```bash
nvidia-smi              # confirm the card + driver
```
Piper runs fine on CPU. Only use `--cuda` (and `pip install onnxruntime-gpu`) if
you have a working CUDA stack and want it. Older Teslas (compute capability
< 7.0) are fine for Piper/CPU.

## 1. Setup on RHEL

```bash
# Python + ffmpeg
sudo dnf install -y python3.11 python3-pip
# ffmpeg: enable RPM Fusion or use a static build
sudo dnf install -y https://download1.rpmfusion.org/free/el/rpmfusion-free-release-$(rpm -E %rhel).noarch.rpm
sudo dnf install -y ffmpeg
ffmpeg -version            # verify

python3.11 -m venv ~/tts && source ~/tts/bin/activate
pip install --upgrade pip
pip install piper-tts
# (GPU, optional) pip install onnxruntime-gpu
```

## 2. Download voice models

From https://huggingface.co/rhasspy/piper-voices (each voice = an `.onnx` plus a
matching `.onnx.json`; keep them together):

```bash
mkdir -p voices && cd voices
# German (CC0, commercial-safe)
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json
# English (optional)
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json
# Turkish (optional)
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx.json
cd ..
```

Check each list at huggingface for the exact newest filenames/qualities.

## 3. Generate

From the repo root (with the venv active):

```bash
export PIPER_DE=voices/de_DE-thorsten-high.onnx
export PIPER_EN=voices/en_US-amy-medium.onnx
export PIPER_TR=voices/tr_TR-dfki-medium.onnx

# German only (start here)
python scripts/generate-voices.py

# all three, overwrite, GPU
python scripts/generate-voices.py --langs de,en,tr --force --cuda
```

Tuning: `PIPER_LENGTH_SCALE=1.2` (default 1.15) speaks slower for little kids.

## 4. Wire it in

```bash
npm run assets     # rescans and updates the asset manifest
npm run dev        # listen and check a few
```
Commit the new `public/exercises/<id>/audio.*.mp3` files and push. The deploy
picks them up; the app now plays the recordings instead of TTS.

> The audio files add weight to the repo. Keep them small (the script already
> outputs ~128 kbps mono mp3, typically 10–30 KB per clip). If they ever get
> large, lower `-b:a` in the script.

## Quality tips

- **One voice per language** for consistency (don't mix Thorsten with others).
- The script already **normalizes loudness** and **trims silence** at both ends.
- Listen to a handful first; if a German phrase mispronounces, tweak the text in
  `phrase_packs.json` slightly (Piper is phonetic-ish) and regenerate that id.
