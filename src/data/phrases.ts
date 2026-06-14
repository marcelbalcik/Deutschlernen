import type {
  CategoryId,
  PhraseContent,
  PhraseItem,
  SourceLanguage,
} from "@/types/phrase";
import packsData from "./phrase_packs.json";

// ---------------------------------------------------------------------------
// Content is generated from phrase_packs.json (the authoring source of truth:
// 4 packs × 50 phrases, each with en/de/tr text + a scene). Images map 1:1 by
// id to public/exercises/_raw/<id>.png. German (de) is the target; en/tr are
// the family-language translations.
// ---------------------------------------------------------------------------

type RawPhrase = {
  id: string;
  text: { en: string; de: string; tr: string };
  scene: string;
};
type RawPack = {
  id: string;
  name: Record<string, string>;
  phrases: RawPhrase[];
};

const PACKS = (packsData as { packs: RawPack[] }).packs;

// Fallback emoji per pack (shown only if an image fails to load).
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
    emoji: CATEGORY_EMOJI[pack.id] ?? "🙂",
    imageAsset: `/exercises/_raw/${p.id}.png`,
    difficulty: 1 as const,
    tags: [],
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
  }));
}

export function getPhrasesByCategory(
  category: string,
  source: SourceLanguage
): PhraseItem[] {
  return getPhrases(source).filter((p) => p.category === category);
}

export function getPhraseById(
  id: string,
  source: SourceLanguage
): PhraseItem | undefined {
  return getPhrases(source).find((p) => p.id === id);
}
