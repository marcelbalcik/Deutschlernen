"use client";

import TopBar from "@/components/TopBar";
import CategoryGrid from "@/components/CategoryGrid";

/** Category picker for the "Listen & Pick" game. */
export default function PlayCategoryPage() {
  return (
    <>
      <TopBar title="Hören & Tippen" backHref="/" />
      <p style={{ textAlign: "center", color: "var(--muted)", marginTop: 0 }}>
        Wähle eine Gruppe
      </p>
      <CategoryGrid hrefBase="/play" />
    </>
  );
}
