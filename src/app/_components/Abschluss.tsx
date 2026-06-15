"use client";

import { Auswertung } from "@/lib/content";
import { Card, Button, useCountUp } from "./ui";
import { AufgabenErgebnis } from "./MiniAufgaben";
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
  const geloest = [aufgaben.bitUhr, aufgaben.triage, aufgaben.zuordnung].filter(Boolean).length;
  const topStaerke = auswertung.staerken[0];
  const animPassung = useCountUp(auswertung.passung);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Confetti />
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-green to-green-dark px-8 py-10 text-center text-white sm:px-10">
          <div className="text-5xl">🎉</div>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Geschafft, {name}!</h2>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-white/90">
            Du hast die Berufswahl-Analyse abgeschlossen. Nimm diese
            Zusammenfassung mit ins Gespräch mit deiner Berufsbildnerin oder
            deinem Berufsbildner.
          </p>
        </div>

        <div className="space-y-5 px-8 py-8 sm:px-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat gross={`${animPassung}%`} klein="Passung zum Beruf" />
            <Stat gross={`${geloest}/3`} klein="Aufgaben gemeistert" />
            <Stat gross={`${topStaerke.dim.emoji}`} klein={`Stärkstes Feld: ${topStaerke.dim.label}`} />
          </div>

          <div className="rounded-2xl bg-green-soft p-5">
            <p className="text-sm font-semibold text-green-dark">Was du heute gezeigt hast</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{auswertung.fazit}</p>
          </div>

          <div className="rounded-2xl border border-line p-5">
            <p className="text-sm font-semibold text-ink">📅 Deine nächsten Schritte</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-soft">
              <li>· Stell am Schnuppertag alle Fragen, die dir durch den Kopf gehen.</li>
              <li>· Probiere die praktischen Aufgaben aus – Fühlen schlägt Vermuten.</li>
              <li>· Interesse an einer Lehrstelle? Bewirb dich bei <span className="font-medium text-ink">nicolas.rick@stadt.sg.ch</span>.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-ink-soft">
              Deine Resultate sieht dein:e Berufsbildner:in im Dashboard.
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
