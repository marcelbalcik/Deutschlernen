import type { Category } from "@/types/phrase";

// Child-facing categories — one per pack in phrase_packs.json. Titles match the
// pack's German name; emoji/color drive the home tiles.
export const CATEGORIES: Category[] = [
  // "Wichtig" (Important) comes first: the critical Kita survival phrases a
  // child needs on day one (toilet, help, home, hurt, scared, hungry...).
  { id: "survival", title: "Wichtig", emoji: "⭐", color: "#FFC1A1", virtual: true },
  { id: "greetings", title: "Begrüßungen", emoji: "👋", color: "#FFD66B" },
  { id: "eating", title: "Essen", emoji: "🍎", color: "#A0E7A0" },
  { id: "playing", title: "Spielen", emoji: "🧸", color: "#9AD0FF" },
  { id: "feelings_body", title: "Gefühle & Körper", emoji: "❤️", color: "#FFB0C4" },
  // "Gemischt" (Mixed) draws phrases from across all packs.
  { id: "mixed", title: "Gemischt", emoji: "🎲", color: "#C9B6FF", virtual: true },
];

/** Real content packs only (for the parent "all phrases" listing). */
export const CONTENT_PACKS = CATEGORIES.filter((c) => !c.virtual);

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
