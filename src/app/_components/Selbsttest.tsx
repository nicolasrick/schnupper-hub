"use client";

import { useState } from "react";
import { FRAGEN, SKALA } from "@/lib/content";
import { Card, StepDots } from "./ui";

export function Selbsttest({
  name,
  onDone,
}: {
  name: string;
  onDone: (antworten: Record<string, number>) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [antworten, setAntworten] = useState<Record<string, number>>({});

  const frage = FRAGEN[idx];

  function antworten_(wert: number) {
    const next = { ...antworten, [frage.id]: wert };
    setAntworten(next);
    // kurzes Feedback-Gefühl, dann weiter
    if (idx + 1 < FRAGEN.length) {
      setTimeout(() => setIdx(idx + 1), 180);
    } else {
      setTimeout(() => onDone(next), 200);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card className="p-8 sm:p-10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-green">
            Frage {idx + 1} von {FRAGEN.length}
          </span>
          <StepDots total={FRAGEN.length} current={idx} />
        </div>

        <h2 key={frage.id} className="anim-in mt-6 text-2xl font-bold leading-snug sm:text-3xl">
          {frage.text}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {name}, wie sehr trifft das auf dich zu?
        </p>

        <div className="mt-7 grid gap-3">
          {SKALA.map((s) => {
            const aktiv = antworten[frage.id] === s.wert;
            return (
              <button
                key={s.wert}
                onClick={() => antworten_(s.wert)}
                className={
                  "flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-base font-medium transition " +
                  (aktiv
                    ? "border-green bg-green-soft text-green-dark"
                    : "border-line bg-white hover:border-green/50 hover:bg-green-soft/40")
                }
              >
                <span
                  className={
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs " +
                    (aktiv ? "border-green bg-green text-white" : "border-line")
                  }
                >
                  {aktiv ? "✓" : ""}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        {idx > 0 && (
          <button
            onClick={() => setIdx(idx - 1)}
            className="mt-6 text-sm text-ink-soft hover:text-ink"
          >
            ← Zurück
          </button>
        )}
      </Card>
    </div>
  );
}
