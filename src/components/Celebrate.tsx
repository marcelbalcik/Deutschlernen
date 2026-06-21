"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Increment this number to trigger a celebration. */
  fire: number;
  /** Bigger, longer burst for end-of-game wins. */
  big?: boolean;
};

const EMOJIS = ["⭐", "🎉", "✨", "🌟", "💫", "🎈"];

/**
 * A full-screen confetti burst with a cheering fox, shown briefly when `fire`
 * changes. Pure CSS/emoji — no assets. pointer-events: none so it never blocks
 * taps.
 */
export default function Celebrate({ fire, big = false }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (fire <= 0) return;
    setActive(fire);
    const t = setTimeout(() => setActive(0), big ? 2000 : 1200);
    return () => clearTimeout(t);
  }, [fire, big]);

  if (active === 0) return null;

  const count = big ? 36 : 18;
  return (
    <div className="celebrate-layer" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={`${active}-${i}`}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.25}s`,
            animationDuration: `${0.9 + Math.random() * 0.7}s`,
            fontSize: `${20 + Math.random() * 18}px`,
          }}
        >
          {EMOJIS[i % EMOJIS.length]}
        </span>
      ))}
      <div className={`cheer-mascot ${big ? "big" : ""}`}>🦊</div>
    </div>
  );
}
