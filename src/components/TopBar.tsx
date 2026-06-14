"use client";

import { useRouter } from "next/navigation";

type Props = {
  title: string;
  /** Where the back arrow goes. Defaults to browser back. */
  backHref?: string;
};

export default function TopBar({ title, backHref }: Props) {
  const router = useRouter();
  return (
    <div className="topbar">
      <button
        className="back-btn"
        aria-label="Back"
        onClick={() => (backHref ? router.push(backHref) : router.back())}
      >
        ⬅️
      </button>
      <h1>{title}</h1>
      {/* Spacer to keep the title centered. */}
      <span style={{ width: 34 }} />
    </div>
  );
}
