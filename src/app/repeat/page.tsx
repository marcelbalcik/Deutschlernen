"use client";

import TopBar from "@/components/TopBar";
import CategoryGrid from "@/components/CategoryGrid";

/** Category picker for the "Listen & Repeat" game. */
export default function RepeatCategoryPage() {
  return (
    <>
      <TopBar title="Hören & Sprechen" backHref="/" />
      <p style={{ textAlign: "center", color: "var(--muted)", marginTop: 0 }}>
        Wähle eine Gruppe
      </p>
      <CategoryGrid hrefBase="/repeat" />
    </>
  );
}
