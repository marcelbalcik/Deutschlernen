"use client";

import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/categories";

/**
 * Home / category select. The child taps a big picture tile to enter a pack.
 * A small, low-contrast corner button leads to the gated Parent area.
 */
export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <div className="home-hero">
        <div className="logo" aria-hidden>
          🐻
        </div>
        <h1>Kita-Sprache</h1>
        <p>Tippe ein Bild und hör zu!</p>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className="category-tile"
            style={{ background: c.color }}
            onClick={() => router.push(`/learn/${c.id}`)}
            aria-label={c.title}
          >
            <span className="emoji" aria-hidden>
              {c.emoji}
            </span>
            <span className="label">{c.title}</span>
          </button>
        ))}
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
