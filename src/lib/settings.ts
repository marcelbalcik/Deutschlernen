"use client";

import { useEffect, useState } from "react";
import type { SourceLanguage } from "@/types/phrase";

// App-wide settings the PARENT controls, persisted to localStorage:
//  - source language (the family's language, shown only in parent mode)
//  - whether the German text is shown under flashcards
//
// Children never change these; they live behind the parent gate.

const SOURCE_KEY = "kita_source_lang_v1";
const SHOW_TEXT_KEY = "kita_show_text_v1";

export function getSourceLanguage(): SourceLanguage {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(SOURCE_KEY);
  return v === "tr" ? "tr" : "en";
}

export function setSourceLanguage(lang: SourceLanguage): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOURCE_KEY, lang);
}

export function getShowText(): boolean {
  if (typeof window === "undefined") return true;
  // Default: show the German text (helps pre-readers' parents and older kids).
  return window.localStorage.getItem(SHOW_TEXT_KEY) !== "false";
}

export function setShowText(show: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHOW_TEXT_KEY, show ? "true" : "false");
}

/**
 * React hook for reading settings on the client without hydration mismatch.
 * Returns sensible defaults during SSR, then syncs from localStorage on mount.
 */
export function useSettings() {
  const [source, setSource] = useState<SourceLanguage>("en");
  const [showText, setShowTextState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSource(getSourceLanguage());
    setShowTextState(getShowText());
    setReady(true);
  }, []);

  return {
    ready,
    source,
    showText,
    updateSource(lang: SourceLanguage) {
      setSourceLanguage(lang);
      setSource(lang);
    },
    updateShowText(show: boolean) {
      setShowText(show);
      setShowTextState(show);
    },
  };
}
