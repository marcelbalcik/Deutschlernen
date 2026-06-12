import type { Category } from "@/types/phrase";

// Child-facing categories. Kept to four for the MVP so the home screen stays
// uncluttered (few choices per screen). "kita" exists in the type for future
// packs but is intentionally not shown yet.
export const CATEGORIES: Category[] = [
  { id: "greetings", title: "Begrüßung", emoji: "👋", color: "#FFD66B" },
  { id: "eating", title: "Essen", emoji: "🍎", color: "#A0E7A0" },
  { id: "playing", title: "Spielen", emoji: "🧸", color: "#9AD0FF" },
  { id: "health", title: "Gefühle & Körper", emoji: "❤️", color: "#FFB0C4" },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
