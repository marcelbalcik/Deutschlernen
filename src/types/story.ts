import type { SourceLanguage } from "./phrase";

// A story is an ordered list of beats. Narration beats are read aloud (in the
// family language); game beats drop the child into the Pick or Speak mechanic
// using a phrase from that moment of the story.

export type StoryNarration = {
  type: "narration";
  text: Record<SourceLanguage, string>;
  emoji: string;
};

export type StoryGame = {
  type: "game";
  /** id of a phrase in phrase_packs.json */
  phraseId: string;
  /** which mini-game to play at this beat */
  mode: "pick" | "speak";
};

export type StoryStep = StoryNarration | StoryGame;

export type Story = {
  id: string;
  emoji: string;
  title: Record<SourceLanguage, string>;
  steps: StoryStep[];
};
