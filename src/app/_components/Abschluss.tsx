"use client";

import { Auswertung } from "@/lib/content";
import { Card, Button, useCountUp } from "./ui";
import { AufgabenErgebnis } from "./EignungsCheck";
import { Confetti } from "./Confetti";

export function Abschluss({
  name,
  auswertung,
  aufgaben,
  onRestart,
}: {
  name: string;
  auswertung: Auswertung;
  aufgaben: AufgabenErgebnis;
  onRestart: () => void;
}) {
  const topStaerke = auswertung.staerken[0];
  const animPassung = useCountUp(auswertung.passung);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Confetti />
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-green to-green-dark px-8 py-10 text-center text-white sm:px-10">
          <div className="text-5xl">✅</div>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Analyse abgeschlossen, {name}.</h2>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-white/90">
            Das ist deine persönliche Standortbestimmung zum <b>Start</b> in den
            Schnuppertag – ein erstes Bild, kein Urteil. Wie es sich wirklich
            anfühlt, findest du heute selbst heraus.
          </p>
        </div>

        <div className="space-y-5 px-8 py-8 sm:px-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat gross={`${animPassung}%`} klein="Passung zum Beruf" />
            <Stat gross={`${aufgaben.selbststaendig}/${aufgaben.total}`} klein="selbstständig gelöst" />
            <Stat gross={`${topStaerke.dim.emoji}`} klein={`Stärkstes Feld: ${topStaerke.dim.label}`} />
          </div>

          <div className="rounded-2xl bg-green-soft p-5">
            <p className="text-sm font-semibold text-green-dark">Deine Einschätzung</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{auswertung.fazit}</p>
            {aufgaben.starkeTeile.length > 0 && (
              <p className="mt-3 text-sm leading-relaxed text-ink">
                <span className="font-semibold text-green-dark">Besonders stark: </span>
                {aufgaben.starkeTeile.join(", ")}.
              </p>
            )}
            {aufgaben.tipps > 0 && (
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Du hast {aufgaben.tipps}× einen Tipp geholt – völlig in Ordnung, Nachfragen gehört im IT-Alltag dazu.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-ink-soft">
              Deine Daten werden ausschliesslich für die Schnuppertage verwendet und anschliessend gelöscht bzw. intern gespeichert.
            </span>
            <Button variant="ghost" onClick={onRestart}>Zur Übersicht →</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Stat({ gross, klein }: { gross: string; klein: string }) {
  return (
    <div className="rounded-2xl border border-line p-4 text-center">
      <div className="text-3xl font-bold leading-none text-green">{gross}</div>
      <div className="mt-1.5 text-xs leading-tight text-ink-soft">{klein}</div>
    </div>
  );
}
