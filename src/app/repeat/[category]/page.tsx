import { CATEGORIES } from "@/data/categories";
import RepeatClient from "./RepeatClient";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export const dynamicParams = false;

export default function RepeatPage() {
  return <RepeatClient />;
}
