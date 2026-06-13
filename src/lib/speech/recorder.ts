// Record-and-playback fallback for when speech recognition isn't available
// (iOS Safari, denied permission, offline). The child records their attempt and
// hears themselves back, then always gets a star. This is a valid practice
// pattern on its own — and it needs no recognition at all.
//
// Audio is kept only in memory for immediate playback and discarded after; it
// is never uploaded or stored. (Privacy: no child voice leaves the device.)

export type SimpleRecorder = {
  stop: () => Promise<string | null>; // returns an object URL to play back
};

export function isRecordingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== "undefined"
  );
}

/** Start recording; resolves with a handle exposing stop() → playback URL. */
export async function startRecording(): Promise<SimpleRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: BlobPart[] = [];
  const rec = new MediaRecorder(stream);
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  rec.start();

  return {
    stop: () =>
      new Promise<string | null>((resolve) => {
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          if (chunks.length === 0) return resolve(null);
          const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
          resolve(URL.createObjectURL(blob));
        };
        rec.stop();
      }),
  };
}
