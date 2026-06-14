// Core content types for the app.
//
// We separate two ideas:
//  1. PhraseContent  -> the canonical, language-neutral content we author once
//                       (German target + emoji + situation + translations).
//  2. PhraseItem     -> a "resolved" phrase for ONE chosen source language,
//                       matching the data model from the product spec. UI
//                       components consume PhraseItem so they never care which
//                       parent language is selected.

export type CategoryId =
  | "survival"
  | "greetings"
  | "eating"
  | "playing"
  | "feelings_body"
  | "mixed";

export type SourceLanguage = "en" | "tr";

export type TargetLanguage = "de";

export type Emotion =
  | "happy"
  | "neutral"
  | "dislike"
  | "tired"
  | "scared"
  | "hurt"
  | "polite"
  | "excited"
  | "cold";

/** What we author by hand, once per phrase. */
export type PhraseContent = {
  id: string;
  category: CategoryId;
  /** The German phrase the child learns to say. */
  phraseTarget: string;
  /** Parent-facing translations, keyed by source language. */
  translations: Record<SourceLanguage, string>;
  /** Short, parent-facing description of when a child would use this. */
  childContext: string;
  /** Scene description — drives the (future) illustration. */
  situationDescription: string;
  emotion: Emotion;
  /** Placeholder visual used until a real illustration is dropped in. */
  emoji: string;
  /** Reserved for the real illustration asset (not required for MVP). */
  imageAsset?: string;
  /** Reserved for real native-speaker audio (MVP uses speech synthesis). */
  audioAsset?: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
  /** Critical Kita "survival" phrase — surfaced first in the Wichtig pack. */
  priority?: boolean;
};

/** A phrase resolved for a single source language. Matches the spec's data model. */
export type PhraseItem = {
  id: string;
  category: CategoryId;
  targetLanguage: TargetLanguage;
  sourceLanguage: SourceLanguage;
  phraseTarget: string;
  phraseSource: string;
  childContext: string;
  situationDescription: string;
  emotion: Emotion;
  emoji: string;
  imageAsset?: string;
  audioAsset?: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
  priority?: boolean;
};

export type Category = {
  id: CategoryId;
  /** Title shown in parent mode (German). */
  title: string;
  /** Big friendly emoji used on the child-facing category tile. */
  emoji: string;
  /** Theme color for the category tile. */
  color: string;
  /** Virtual selections (survival, mixed) that aggregate other packs, not a
   *  real content pack. Excluded from the parent "all phrases" listing. */
  virtual?: boolean;
};
