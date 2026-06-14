import { STORIES } from "@/data/stories";
import StoryClient from "./StoryClient";

// The dynamic segment is named [category] to match the static-export param
// shape used elsewhere; its value is the story id.
export function generateStaticParams() {
  return STORIES.map((s) => ({ category: s.id }));
}

export const dynamicParams = false;

export default function StoryPage() {
  return <StoryClient />;
}
