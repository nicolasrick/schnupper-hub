"use client";

import { ReactNode, useEffect, useState } from "react";

/** Zählt eine Zahl flüssig von 0 auf den Zielwert hoch (für den Wow-Moment). */
export function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "anim-in rounded-3xl bg-surface text-ink shadow-2xl shadow-black/30 ring-1 ring-black/5 " +
        className
      }
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "bg-green text-white hover:bg-green-dark shadow-lg shadow-green/30"
      : "bg-transparent text-ink-soft hover:text-ink hover:bg-black/5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/** Schmaler Fortschrittsbalken (z. B. Frage 3 / 10) */
export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={
            "h-1.5 rounded-full transition-all " +
            (i < current
              ? "w-6 bg-green"
              : i === current
              ? "w-6 bg-green/40"
              : "w-1.5 bg-black/10")
          }
        />
      ))}
    </div>
  );
}

/** Durchgehende Fortschrittsleiste 0..1 — skaliert auf beliebig viele Schritte
 *  (ersetzt die Punkte-Reihe, sobald es viele Schritte sind). */
export function Fortschritt({ value, tone = "light" }: { value: number; tone?: "light" | "dark" }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const track = tone === "dark" ? "bg-white/15" : "bg-black/10";
  return (
    <div className={"h-1.5 w-full overflow-hidden rounded-full " + track}>
      <div
        className="h-full rounded-full bg-green transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Horizontaler Wert-Balken 0..1 für die Auswertung */
export function Bar({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  const pct = Math.round(value * 100);
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-ink">
          <span className="mr-1.5">{emoji}</span>
          {label}
        </span>
        <span className="tabular-nums text-ink-soft">{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-black/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green to-accent transition-[width] duration-1000 ease-out"
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

/** Zurück-Leiste für Hub-Unterseiten */
export function BackBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/20 hover:text-white"
      >
        ← Übersicht
      </button>
      <span className="text-sm font-semibold text-white/80">{title}</span>
    </div>
  );
}

/** Schlichter Text-Schriftzug (kein offizielles Logo – nicht freigegeben).
 *  Roter CI-Balken als dezenter Marken-Akzent auf dunklem Grund. */
export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-7 w-1 rounded-full bg-green" aria-hidden />
      <span className="leading-tight">
        <span className="block text-base font-bold tracking-tight text-white">
          Stadt St.&nbsp;Gallen
        </span>
        <span className="block text-xs font-medium text-white/55">
          Informatikdienste · Plattformentwicklung EFZ
        </span>
      </span>
    </div>
  );
}
