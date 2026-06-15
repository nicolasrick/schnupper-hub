"use client";

import { Auswertung } from "@/lib/content";
import { Card, Button, Bar, useCountUp } from "./ui";

export function FitProfil({
  name,
  auswertung,
  onNext,
}: {
  name: string;
  auswertung: Auswertung;
  onNext: () => void;
}) {
  const { passung, scores, staerken, wachstum, fazit } = auswertung;
  const animPassung = useCountUp(passung);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="overflow-hidden">
        {/* Kopf mit Passungs-Wert */}
        <div className="bg-gradient-to-br from-green to-green-dark px-8 py-8 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            Dein Fit-Profil, {name}
          </p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-6xl font-bold tabular-nums leading-none">{animPassung}%</span>
            <span className="mb-1 text-lg text-white/85">Passung</span>
          </div>
          <p className="mt-3 max-w-prose leading-relaxed text-white/90">{fazit}</p>
        </div>

        <div className="space-y-6 px-8 py-8 sm:px-10">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Deine Profil-Verteilung
            </h3>
            <div className="space-y-4">
              {scores.map((s) => (
                <Bar key={s.dim.id} value={s.anteil} label={s.dim.label} emoji={s.dim.emoji} />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-green-soft p-5">
              <p className="mb-2 text-sm font-semibold text-green-dark">✅ Das spricht für dich</p>
              <ul className="space-y-2 text-sm leading-relaxed text-ink">
                {staerken.map((s) => (
                  <li key={s.dim.id}>
                    <span className="font-semibold">{s.dim.emoji} {s.dim.label}:</span>{" "}
                    {s.dim.staerke}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-amber/10 p-5">
              <p className="mb-2 text-sm font-semibold text-amber">🌱 Daran darfst du wachsen</p>
              <ul className="space-y-2 text-sm leading-relaxed text-ink">
                {wachstum.map((s) => (
                  <li key={s.dim.id}>
                    <span className="font-semibold">{s.dim.emoji} {s.dim.label}:</span>{" "}
                    {s.dim.wachstum}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-ink-soft">
            Wichtig: Das ist eine Momentaufnahme, kein Urteil. Am ehrlichsten
            merkst du beim Ausprobieren, ob dir der Beruf liegt.
          </p>

          <div className="flex justify-end pt-2">
            <Button onClick={onNext}>Weiter zu den Aufgaben →</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
