"use client";

import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/categories";

type Props = {
  /** Route prefix a tapped category links to, e.g. "/play" or "/repeat". */
  hrefBase: string;
};

/** The four big picture packs. Shared by both game modes' category screens. */
export default function CategoryGrid({ hrefBase }: Props) {
  const router = useRouter();
  return (
    <div className="category-grid">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          className="category-tile"
          style={{ background: c.tile }}
          onClick={() => router.push(`${hrefBase}/${c.id}`)}
          aria-label={c.title}
        >
          <span className="cat-chip" style={{ background: c.chip }} aria-hidden>
            {c.emoji}
          </span>
          <span className="cat-name">{c.title}</span>
        </button>
      ))}
    </div>
  );
}
