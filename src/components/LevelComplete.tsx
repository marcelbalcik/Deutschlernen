"use client";

import { useState } from "react";
import CatchStar from "./CatchStar";
import Celebrate from "./Celebrate";
import { sfxWin } from "@/lib/sfx";
import { addStars } from "@/lib/progress";

type Props = {
  onAgain: () => void;
  onHome: () => void;
  homeEmoji?: string;
  homeLabel?: string;
};

/**
 * The end-of-level reward: first a star bounces around the screen and the child
 * must tap to catch it (which adds to their star total), then the celebration +
 * "again / home" buttons are revealed.
 */
export default function LevelComplete({
  onAgain,
  onHome,
  homeEmoji = "🏠",
  homeLabel = "Start",
}: Props) {
  const [done, setDone] = useState(false);
  const [total, setTotal] = useState(0);
  const [fire, setFire] = useState(0);

  function caught() {
    setTotal(addStars(1));
    setFire((f) => f + 1);
    sfxWin();
    setDone(true);
  }

  if (!done) {
    return <CatchStar onCatch={caught} />;
  }

  return (
    <>
      <Celebrate fire={fire} big />
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
