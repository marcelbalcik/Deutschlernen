"use client";

import TopBar from "@/components/TopBar";
import CategoryGrid from "@/components/CategoryGrid";
import CardCountPicker from "@/components/CardCountPicker";

/** Category picker for the "Listen & Repeat" game. */
export default function RepeatCategoryPage() {
  return (
    <>
      <TopBar title="Hören & Sprechen" backHref="/" />
      <CardCountPicker />
      <CategoryGrid hrefBase="/repeat" />
    </>
  );
}
