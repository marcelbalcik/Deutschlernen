"use client";

import { useMemo, useState } from "react";
import TopBar from "@/components/TopBar";
import AccountSection from "@/components/AccountSection";
import { CONTENT_PACKS } from "@/data/categories";
import { getPhrases } from "@/data/phrases";
import { useSettings } from "@/lib/settings";
import { playPhraseItem } from "@/lib/audio";
import { getCorrect, getSeen, getSpoken, resetProgress } from "@/lib/progress";
import type { SourceLanguage } from "@/types/phrase";

// A tiny adult gate: solve a simple sum a young child cannot. Not security —
// just a speed bump so kids don't wander into settings. (Spec: "protected from
// child accidental access".)
function makeChallenge() {
  const a = 3 + Math.floor(Math.random() * 5); // 3..7
  const b = 2 + Math.floor(Math.random() * 5); // 2..6
  return { a, b, answer: a + b };
}

export default function ParentPage() {
  const [challenge] = useState(makeChallenge);
  const [entry, setEntry] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <>
        <TopBar title="Für Eltern" backHref="/" />
        <div className="parent-gate">
          <h2>
            Wie viel ist {challenge.a} + {challenge.b}?
          </h2>
          <p className="hint">For grown-ups only</p>
          <div className="gate-input" aria-label="answer">
            {entry || "?"}
          </div>
          <div className="gate-keys">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} onClick={() => setEntry((e) => (e + n).slice(0, 2))}>
                {n}
              </button>
            ))}
            <button onClick={() => setEntry("")}>✖️</button>
            <button onClick={() => setEntry((e) => (e + "0").slice(0, 2))}>0</button>
            <button
              onClick={() => {
                if (Number(entry) === challenge.answer) setUnlocked(true);
                else setEntry("");
              }}
            >
              ✔️
            </button>
          </div>
        </div>
      </>
    );
  }

  return <ParentDashboard />;
}

function ParentDashboard() {
  const {
    ready,
    source,
    showText,
    speechBackend,
    updateSource,
    updateShowText,
    updateSpeechBackend,
  } = useSettings();
  const [, force] = useState(0);

  const phrases = useMemo(() => getPhrases(source), [source]);
  const seen = getSeen();
  const correct = getCorrect();
  const spoken = getSpoken();

  if (!ready) return <TopBar title="Für Eltern" backHref="/" />;

  const total = phrases.length;
  const seenCount = phrases.filter((p) => seen.has(p.id)).length;
  const correctCount = phrases.filter((p) => correct.has(p.id)).length;
  const spokenCount = phrases.filter((p) => spoken.has(p.id)).length;

  return (
    <>
      <TopBar title="Für Eltern" backHref="/" />

      <AccountSection />

      <div className="parent-section">
        <h3>Settings</h3>
        <div className="parent-row">
          <span>Your language</span>
          <div className="seg">
            {(["en", "tr"] as SourceLanguage[]).map((l) => (
              <button
                key={l}
                className={source === l ? "active" : ""}
                onClick={() => updateSource(l)}
              >
                {l === "en" ? "English" : "Türkçe"}
              </button>
            ))}
          </div>
        </div>
        <div className="parent-row">
          <span>Show German text</span>
          <div className="seg">
            <button
              className={showText ? "active" : ""}
              onClick={() => updateShowText(true)}
            >
              On
            </button>
            <button
              className={!showText ? "active" : ""}
              onClick={() => updateShowText(false)}
            >
              Off
            </button>
          </div>
        </div>
        <div className="parent-row">
          <span>Speech recognition</span>
          <div className="seg">
            <button
              className={speechBackend === "web" ? "active" : ""}
              onClick={() => updateSpeechBackend("web")}
            >
              Fast
            </button>
            <button
              className={speechBackend === "vosk" ? "active" : ""}
              onClick={() => updateSpeechBackend("vosk")}
            >
              Private
            </button>
          </div>
        </div>
        <p className="muted-note" style={{ textAlign: "left", marginTop: 4 }}>
          <strong>Fast</strong> uses the browser&apos;s recognizer (audio may be
          processed in the cloud). <strong>Private</strong> runs fully on this
          device and offline, but downloads a ~45&nbsp;MB German model the first
          time. Falls back to Fast if the model isn&apos;t installed.
        </p>
      </div>

      <div className="parent-section">
        <h3>Progress</h3>
        <div className="parent-row">
          <span>Phrases seen</span>
          <strong>
            {seenCount} / {total}
          </strong>
        </div>
        <div className="parent-row">
          <span>Matched in game</span>
          <strong>
            {correctCount} / {total}
          </strong>
        </div>
        <div className="parent-row">
          <span>Practiced speaking</span>
          <strong>
            {spokenCount} / {total}
          </strong>
        </div>
        <button
          className="danger-btn"
          style={{ marginTop: 10 }}
          onClick={() => {
            resetProgress();
            force((n) => n + 1);
          }}
        >
          Reset progress
        </button>
      </div>

      <div className="parent-section">
        <h3>All phrases</h3>
        {CONTENT_PACKS.map((cat) => (
          <div key={cat.id} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, margin: "6px 0" }}>
              {cat.emoji} {cat.title}
            </div>
            <ul className="phrase-list">
              {phrases
                .filter((p) => p.category === cat.id)
                .map((p) => (
                  <li key={p.id}>
                    <span className="pl-emoji" aria-hidden>
                      {p.emoji}
                    </span>
                    <span className="pl-text">
                      <span className="pl-de">{p.phraseTarget}</span>
                      <br />
                      <span className="pl-src">{p.phraseSource}</span>
                    </span>
                    <button
                      className="pl-play"
                      aria-label={`Play ${p.phraseTarget}`}
                      onClick={() => playPhraseItem(p)}
                    >
                      🔊
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="muted-note">
        All progress is stored only on this device. No accounts, no tracking.
      </p>
    </>
  );
}
