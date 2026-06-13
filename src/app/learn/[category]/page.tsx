import { CATEGORIES } from "@/data/categories";
import LearnClient from "./LearnClient";

// Pre-render one page per category so the route works as a fully static export
// (GitHub Pages has no server to render dynamic params on demand).
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export const dynamicParams = false;

export default function LearnPage() {
  return <LearnClient />;
}
