"use client";

import { TAGESABLAUF, TAETIGKEITEN, AUSBILDUNGSWEG } from "@/lib/content";
import { Card, Button } from "./ui";

export function DasErwartetDich({ onNext }: { onNext: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Das erwartet dich</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/70">
          Ehrlich und ungeschönt: So sieht der Alltag in der Lehre aus – das
          Spannende und das weniger Glamouröse.
        </p>
      </div>

      {/* Tätigkeiten */}
      <Card className="p-7 sm:p-9">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Womit du dich beschäftigst
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {TAETIGKEITEN.map((t) => (
            <div key={t.titel} className="rounded-2xl border border-line p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-soft text-xl">
                  {t.emoji}
                </span>
                <h4 className="text-lg font-bold">{t.titel}</h4>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink">{t.text}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                <span className="font-semibold text-amber">Ehrlich: </span>
                {t.ehrlich}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Tagesablauf */}
        <Card className="p-7 sm:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Dein Schnuppertag
          </h3>
          <ol className="mt-5 space-y-3">
            {TAGESABLAUF.map((s) => (
              <li key={s.zeit} className="flex gap-3">
                <span className="w-12 shrink-0 text-sm font-bold tabular-nums text-green">
                  {s.zeit}
                </span>
                <span className="text-sm leading-snug text-ink">{s.text}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Ausbildungsweg */}
        <Card className="p-7 sm:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Dein Weg zum Profi
          </h3>
          <ol className="mt-5 space-y-3">
            {AUSBILDUNGSWEG.map((w, i) => (
              <li
                key={i}
                className={
                  "relative rounded-2xl border p-4 " +
                  (w.aktiv ? "border-green bg-green-soft" : "border-line bg-white")
                }
              >
                <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                  {w.dauer}
                </span>
                <p className={"mt-0.5 text-sm font-semibold leading-snug " + (w.aktiv ? "text-green-dark" : "text-ink")}>
                  {w.titel}
                  {w.aktiv && <span className="ml-1.5 align-middle text-[11px] font-bold text-green">← hier startest du</span>}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="flex justify-center pt-2">
        <Button onClick={onNext}>Meine Zusammenfassung ansehen →</Button>
      </div>
    </div>
  );
}
