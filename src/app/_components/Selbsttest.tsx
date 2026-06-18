"use client";

import { useState } from "react";
import { FRAGEN, SKALA, Frage } from "@/lib/content";
import { Card, Button, Fortschritt } from "./ui";

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
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="whitespace-nowrap text-sm font-semibold text-green">
              Frage {idx + 1} von {FRAGEN.length}
            </span>
            <span className="tabular-nums text-xs font-medium text-ink-soft">
              {Math.round(((idx + 1) / FRAGEN.length) * 100)}%
            </span>
          </div>
          <Fortschritt value={idx / FRAGEN.length} tone="light" />
        </div>

        <h2 key={frage.id} className="anim-in mt-6 text-2xl font-bold leading-snug sm:text-3xl">
          {frage.text}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {frage.slider ? `${name}, wo ordnest du dich ein?` : `${name}, wie sehr trifft das auf dich zu?`}
        </p>

        {frage.slider ? (
          <SliderFrage key={`slider-${frage.id}`} frage={frage} onWaehlen={antworten_} />
        ) : (
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
        )}

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

/** Schieberegler-Variante: man stellt sich auf einer Skala ein, statt einen Knopf
 *  zu drücken. Wert bleibt 0–3 (wie die Knöpfe), das Scoring ist identisch. */
function SliderFrage({ frage, onWaehlen }: { frage: Frage; onWaehlen: (wert: number) => void }) {
  const [wert, setWert] = useState(2);
  const [beruehrt, setBeruehrt] = useState(false);
  const label = SKALA.find((s) => s.wert === wert)?.label ?? "";

  return (
    <div className="mt-7">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-ink-soft">
        <span>{frage.slider!.links}</span>
        <span>{frage.slider!.rechts}</span>
      </div>
      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={wert}
        onChange={(e) => { setWert(Number(e.target.value)); setBeruehrt(true); }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-green-soft accent-green"
      />
      <div className="mt-1 flex justify-between px-1 text-[10px] text-ink-soft/70">
        {[0, 1, 2, 3].map((n) => <span key={n}>•</span>)}
      </div>
      <div className="mt-4 text-center">
        <span className={"inline-block rounded-full px-4 py-1.5 text-sm font-semibold transition " + (beruehrt ? "bg-green-soft text-green-dark" : "bg-black/5 text-ink-soft")}>
          {beruehrt ? label : "Schieb den Regler auf deine Antwort"}
        </span>
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={() => onWaehlen(wert)} disabled={!beruehrt}>Weiter →</Button>
      </div>
    </div>
  );
}
