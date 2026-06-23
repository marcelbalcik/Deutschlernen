#!/usr/bin/env python3
"""Generate spoken audio for every phrase with Piper TTS.

Reads src/data/phrase_packs.json and writes, per phrase id, into the audio
convention the app already uses:

  public/exercises/<id>/audio.mp3      (German  -> text.de)   [target phrase]
  public/exercises/<id>/audio.en.mp3   (English -> text.en)   [optional]
  public/exercises/<id>/audio.tr.mp3   (Turkish -> text.tr)   [optional]

Pipeline per clip:  piper -> WAV  ->  ffmpeg (loudnorm + trim silence + mono mp3)

Requirements on the workstation:
  pip install piper-tts
  ffmpeg on PATH
  Piper voice models (.onnx + .onnx.json), e.g. from
  https://huggingface.co/rhasspy/piper-voices

Point the script at your models via env vars (paths to the .onnx files):
  PIPER_DE=voices/de_DE-thorsten-high.onnx
  PIPER_EN=voices/en_US-amy-medium.onnx
  PIPER_TR=voices/tr_TR-dfki-medium.onnx

Examples:
  python scripts/generate-voices.py                 # German only
  python scripts/generate-voices.py --langs de,en,tr
  python scripts/generate-voices.py --force         # overwrite existing
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / "src" / "data" / "phrase_packs.json"
OUT = ROOT / "public" / "exercises"

VOICES = {
    "de": os.environ.get("PIPER_DE", "voices/de_DE-thorsten-high.onnx"),
    "en": os.environ.get("PIPER_EN", "voices/en_US-amy-medium.onnx"),
    "tr": os.environ.get("PIPER_TR", "voices/tr_TR-dfki-medium.onnx"),
}
OUT_FILE = {"de": "audio.mp3", "en": "audio.en.mp3", "tr": "audio.tr.mp3"}

# Slightly slower than default — easier for young children to follow.
LENGTH_SCALE = os.environ.get("PIPER_LENGTH_SCALE", "1.15")


def need(cmd: str) -> None:
    if shutil.which(cmd) is None:
        sys.exit(f"error: '{cmd}' not found on PATH")


def synth(text: str, model: str, out_mp3: Path, use_cuda: bool) -> None:
    fd, wav = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        piper_cmd = ["piper", "-m", model, "-f", wav,
                     "--length_scale", LENGTH_SCALE]
        if use_cuda:
            piper_cmd.append("--cuda")
        subprocess.run(piper_cmd, input=text.encode("utf-8"), check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(
            ["ffmpeg", "-y", "-i", wav,
             "-af",
             "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
             "areverse,"
             "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
             "areverse,"
             "loudnorm=I=-16:TP=-1.5:LRA=11",
             "-ac", "1", "-ar", "44100", "-b:a", "128k", str(out_mp3)],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    finally:
        os.path.exists(wav) and os.unlink(wav)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--langs", default="de", help="comma list, e.g. de,en,tr")
    ap.add_argument("--force", action="store_true", help="overwrite existing")
    ap.add_argument("--cuda", action="store_true", help="use GPU (onnxruntime-gpu)")
    args = ap.parse_args()

    langs = [x.strip() for x in args.langs.split(",") if x.strip()]
    need("piper")
    need("ffmpeg")
    for lang in langs:
        model = VOICES.get(lang)
        if not model or not Path(model).exists():
            sys.exit(f"error: voice model for '{lang}' not found: {model}\n"
                     f"set the PIPER_{lang.upper()} env var to its .onnx path")

    data = json.loads(PACK.read_text(encoding="utf-8"))
    made = skipped = 0
    for pack in data["packs"]:
        for ph in pack["phrases"]:
            pid = ph["id"]
            folder = OUT / pid
            folder.mkdir(parents=True, exist_ok=True)
            for lang in langs:
                text = (ph.get("text") or {}).get(lang)
                if not text:
                    continue
                out_mp3 = folder / OUT_FILE[lang]
                if out_mp3.exists() and not args.force:
                    skipped += 1
                    continue
                print(f"{pid} [{lang}] {text}")
                synth(text, VOICES[lang], out_mp3, args.cuda)
                made += 1

    print(f"\nDone: {made} generated, {skipped} skipped.")
    print("Next: `npm run assets` to refresh the manifest, then build/deploy.")


if __name__ == "__main__":
    main()
