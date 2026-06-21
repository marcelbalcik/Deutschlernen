"use client";

import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { STORIES } from "@/data/stories";
import { useSettings } from "@/lib/settings";

const TILE_COLORS = [
  "#FFD66B",
  "#A0E7A0",
  "#9AD0FF",
  "#FFB0C4",
  "#C9B6FF",
  "#FFC1A1",
  "#B5EAD7",
  "#FFDAC1",
  "#C7CEEA",
  "#E2F0CB",
];

/** Pick a story. The child taps a big picture tile. */
export default function StoryListPage() {
  const router = useRouter();
  const { ready, source } = useSettings();

  return (
    <>
      <TopBar title="Geschichten" backHref="/" />
      <div className="category-grid">
        {STORIES.map((s, i) => (
          <button
            key={s.id}
            className="category-tile"
            style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}
            onClick={() => router.push(`/story/${s.id}`)}
            aria-label={ready ? s.title[source] : s.id}
          >
            <span
              className="cat-chip"
              style={{ background: "rgba(255,255,255,0.55)" }}
              aria-hidden
            >
              {s.emoji}
            </span>
            <span className="cat-name">{ready ? s.title[source] : ""}</span>
          </button>
        ))}
      </div>
    </>
  );
}
