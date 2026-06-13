import { CATEGORIES } from "@/data/categories";
import PlayClient from "./PlayClient";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export const dynamicParams = false;

export default function PlayPage() {
  return <PlayClient />;
}
