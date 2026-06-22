"use client";

import { useEffect, useState } from "react";
import { sfxStar } from "@/lib/sfx";

type Props = {
  onCatch: () => void;
};

/**
 * A big star that jumps around the screen; the child taps it to "catch" it.
 * Used as the reward moment when a level is completed.
 */
export default function CatchStar({ onCatch }: Props) {
  const [pos, setPos] = useState({ top: 45, left: 45 });
  const [caught, setCaught] = useState(false);

  useEffect(() => {
    if (caught) return;
    // Jump to a new random spot (kept inside a tappable safe area).
    const move = () =>
      setPos({ top: 16 + Math.random() * 60, left: 10 + Math.random() * 70 });
    move();
    const id = setInterval(move, 1300);
    return () => clearInterval(id);
  }, [caught]);

  function handleCatch() {
    if (caught) return;
    setCaught(true);
    sfxStar();
    setTimeout(onCatch, 480);
  }

  return (
    <div className="catch-layer">
      <p className="catch-hint">Fang den Stern! ⭐</p>
      <button
        className={`catch-star ${caught ? "caught" : ""}`}
        style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
        onClick={handleCatch}
        aria-label="Catch the star"
      >
        ⭐
      </button>
    </div>
  );
}
