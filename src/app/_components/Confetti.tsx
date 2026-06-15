"use client";

import { useEffect, useState } from "react";

// Dezenter Konfetti-Regen in den CI-Farben. Feuert einmal beim Einblenden.
const FARBEN = ["#e00025", "#ff2828", "#a00014", "#1a1a1a", "#d8d5c5"];

export function Confetti({ count = 70 }: { count?: number }) {
  const [stuecke, setStuecke] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const pcs: React.CSSProperties[] = Array.from({ length: count }).map(() => ({
      left: `${Math.random() * 100}vw`,
      backgroundColor: FARBEN[Math.floor(Math.random() * FARBEN.length)],
      animationDuration: `${2 + Math.random() * 1.8}s`,
      animationDelay: `${Math.random() * 0.5}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
      opacity: 0.9,
    }));
    setStuecke(pcs);
    const t = setTimeout(() => setStuecke([]), 4500);
    return () => clearTimeout(t);
  }, [count]);

  if (stuecke.length === 0) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {stuecke.map((style, i) => (
        <span key={i} className="confetti-pc" style={style} />
      ))}
    </div>
  );
}
