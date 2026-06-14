"use client";

import { CARD_COUNT_OPTIONS, useSettings } from "@/lib/settings";

/** Lets the user choose how many cards a game session has: 5 / 10 / 20 / 50. */
export default function CardCountPicker() {
  const { ready, cardCount, updateCardCount } = useSettings();

  return (
    <div className="count-picker">
      <span className="count-label" aria-hidden>
        🃏
      </span>
      <div className="count-options" role="group" aria-label="How many cards">
        {CARD_COUNT_OPTIONS.map((n) => (
          <button
            key={n}
            className={`count-btn ${ready && cardCount === n ? "active" : ""}`}
            onClick={() => updateCardCount(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
