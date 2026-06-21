import type { Category } from "@/types/phrase";

// Child-facing categories — one per pack in phrase_packs.json. Titles match the
// pack's German name; emoji/color drive the home tiles.
export const CATEGORIES: Category[] = [
  // "Wichtig" (Important) comes first: the critical Kita survival phrases a
  // child needs on day one (toilet, help, home, hurt, scared, hungry...).
  { id: "survival", title: "Wichtig", emoji: "⭐", tile: "#fff2d6", chip: "#ffb02e", virtual: true },
  { id: "greetings", title: "Begrüßungen", emoji: "👋", tile: "#d9edff", chip: "#3aa0f0" },
  { id: "eating", title: "Essen", emoji: "🍎", tile: "#ffe4d6", chip: "#ff8a5b" },
  { id: "playing", title: "Spielen", emoji: "🧩", tile: "#e9ddff", chip: "#9b6ef0" },
  { id: "feelings_body", title: "Gefühle & Körper", emoji: "😊", tile: "#d4f4e6", chip: "#2bc48a" },
  // "Gemischt" (Mixed) draws phrases from across all packs.
  { id: "mixed", title: "Gemischt", emoji: "🎲", tile: "#d4f1f5", chip: "#2bb6c4", virtual: true },
];

/** Real content packs only (for the parent "all phrases" listing). */
export const CONTENT_PACKS = CATEGORIES.filter((c) => !c.virtual);

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
