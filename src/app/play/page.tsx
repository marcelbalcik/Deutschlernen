"use client";

import TopBar from "@/components/TopBar";
import CategoryGrid from "@/components/CategoryGrid";
import CardCountPicker from "@/components/CardCountPicker";

/** Category picker for the "Listen & Pick" game. */
export default function PlayCategoryPage() {
  return (
    <>
      <TopBar title="Hören & Tippen" backHref="/" />
      <CardCountPicker />
      <CategoryGrid hrefBase="/play" />
    </>
  );
}
