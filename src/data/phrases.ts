import type {
  CategoryId,
  PhraseContent,
  PhraseItem,
  SourceLanguage,
} from "@/types/phrase";
import packsData from "./phrase_packs.json";
import rawImages from "./rawImages.generated.json";

// ---------------------------------------------------------------------------
// Content is generated from phrase_packs.json (the authoring source of truth).
// German (de) is the target; en/tr are the family-language translations.
// Images map by id to public/exercises/_raw/<id>.png — but only when the file
// actually exists (rawImages manifest); otherwise the phrase shows its emoji.
//
// The "survival" category is virtual: it aggregates every phrase flagged
// priority:true (the critical Kita day-one phrases), so it's not a real pack.
// ---------------------------------------------------------------------------

type RawPhrase = {
  id: string;
  text: { en: string; de: string; tr: string };
  scene: string;
  emoji?: string;
  priority?: boolean;
};
type RawPack = {
  id: string;
  name: Record<string, string>;
  phrases: RawPhrase[];
};

const PACKS = (packsData as { packs: RawPack[] }).packs;
const RAW_IMAGES = new Set(rawImages as string[]);

// Fallback emoji per pack (shown only when a phrase has no image / no own emoji).
const CATEGORY_EMOJI: Record<string, string> = {
  greetings: "👋",
  eating: "🍎",
  playing: "🧸",
  feelings_body: "🙂",
};

export const PHRASES: PhraseContent[] = PACKS.flatMap((pack) =>
  pack.phrases.map((p) => ({
    id: p.id,
    category: pack.id as CategoryId,
    phraseTarget: p.text.de,
    translations: { en: p.text.en, tr: p.text.tr },
    childContext: p.scene,
    situationDescription: p.scene,
    emotion: "neutral" as const,
    emoji: p.emoji ?? CATEGORY_EMOJI[pack.id] ?? "🙂",
    imageAsset: RAW_IMAGES.has(p.id)
      ? `/exercises/_raw/${p.id}.png`
      : undefined,
    difficulty: 1 as const,
    tags: [],
    priority: p.priority ?? false,
  }))
);

/** Resolve canonical content into PhraseItems for a chosen source language. */
export function getPhrases(source: SourceLanguage): PhraseItem[] {
  return PHRASES.map((p) => ({
    id: p.id,
    category: p.category,
    targetLanguage: "de",
    sourceLanguage: source,
    phraseTarget: p.phraseTarget,
    phraseSource: p.translations[source],
    childContext: p.childContext,
    situationDescription: p.situationDescription,
    emotion: p.emotion,
    emoji: p.emoji,
    imageAsset: p.imageAsset,
    audioAsset: p.audioAsset,
    difficulty: p.difficulty,
    tags: p.tags,
    priority: p.priority,
  }));
}

export function getPhrasesByCategory(
  category: string,
  source: SourceLanguage
): PhraseItem[] {
  const all = getPhrases(source);
  // "survival" is virtual: the priority phrases from across all packs.
  if (category === "survival") return all.filter((p) => p.priority);
  return all.filter((p) => p.category === category);
}

export function getPhraseById(
  id: string,
  source: SourceLanguage
): PhraseItem | undefined {
  return getPhrases(source).find((p) => p.id === id);
}
