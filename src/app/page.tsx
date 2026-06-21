"use client";

import { useRouter } from "next/navigation";
import { useSettings } from "@/lib/settings";
import type { SourceLanguage } from "@/types/phrase";

// Start page: the child's grown-up first picks the family language, then the
// child picks one of two game modes. Few, big choices — no reading required.

const LANGS: { id: SourceLanguage; label: string; flag: string }[] = [
  { id: "tr", label: "Türkçe", flag: "🇹🇷" },
  { id: "en", label: "English", flag: "🇬🇧" },
];

export default function StartPage() {
  const router = useRouter();
  const { ready, source, updateSource } = useSettings();

  return (
    <>
      <div className="home-hero">
        <div className="logo" aria-hidden>
          🦊
        </div>
        <h1>Kita-Sprache</h1>
        <p>Hören · Tippen · Sprechen</p>
      </div>

      {/* Step 1: family language */}
      <p className="section-label">Sprache zu Hause</p>
      <div className="lang-row" role="group" aria-label="Choose language">
        {LANGS.map((l) => (
          <button
            key={l.id}
            className={`lang-btn ${ready && source === l.id ? "active" : ""}`}
            onClick={() => updateSource(l.id)}
          >
            <span className="lang-flag" aria-hidden>
              {l.flag}
            </span>
            {l.label}
          </button>
        ))}
      </div>

      {/* Step 2: game mode */}
      <div className="mode-grid">
        <button
          className="mode-card m-accent"
          onClick={() => router.push("/play")}
          aria-label="Listen and pick the picture"
        >
          <span className="mode-chip" aria-hidden>
            👂
          </span>
          <span className="mode-text">
            <span className="mode-title">Hören &amp; Tippen</span>
            <span className="mode-sub">Hör zu, tippe das Bild</span>
          </span>
        </button>

        <button
          className="mode-card m-grape"
          onClick={() => router.push("/repeat")}
          aria-label="Listen and say it"
        >
          <span className="mode-chip" aria-hidden>
            🗣️
          </span>
          <span className="mode-text">
            <span className="mode-title">Hören &amp; Sprechen</span>
            <span className="mode-sub">Hör zu, sprich nach</span>
          </span>
        </button>

        <button
          className="mode-card m-sky"
          onClick={() => router.push("/story")}
          aria-label="Story mode"
        >
          <span className="mode-chip" aria-hidden>
            📖
          </span>
          <span className="mode-text">
            <span className="mode-title">Geschichten</span>
            <span className="mode-sub">Kleine Geschichten</span>
          </span>
        </button>
      </div>

      <button
        className="parent-corner"
        aria-label="Parent area"
        onClick={() => router.push("/parent")}
      >
        👨‍👩‍👧
      </button>
    </>
  );
}
