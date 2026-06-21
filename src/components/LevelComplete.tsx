"use client";

import { useEffect, useState } from "react";
import Celebrate from "./Celebrate";
import { sfxWin } from "@/lib/sfx";
import { getStarTotal } from "@/lib/progress";

type Props = {
  onAgain: () => void;
  onHome: () => void;
  homeEmoji?: string;
  homeLabel?: string;
};

/** End-of-level celebration: fanfare + confetti + total stars + actions. */
export default function LevelComplete({
  onAgain,
  onHome,
  homeEmoji = "🏠",
  homeLabel = "Start",
}: Props) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(getStarTotal());
    sfxWin();
  }, []);

  return (
    <>
      <Celebrate fire={1} big />
      <div className="flashcard" style={{ cursor: "default" }}>
        <span className="finish-mascot" aria-hidden>
          🦊
        </span>
        <p className="phrase-de">Geschafft!</p>
        <p className="win-stars" aria-label={`${total} stars`}>
          ⭐ {total}
        </p>
      </div>
      <div className="end-actions">
        <button className="end-btn primary" aria-label="Again" onClick={onAgain}>
          <span className="end-emoji" aria-hidden>
            🔁
          </span>
          <span className="end-label">Nochmal</span>
        </button>
        <button className="end-btn" aria-label={homeLabel} onClick={onHome}>
          <span className="end-emoji" aria-hidden>
            {homeEmoji}
          </span>
          <span className="end-label">{homeLabel}</span>
        </button>
      </div>
    </>
  );
}
