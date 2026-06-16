"use client";

import { Card, Button, BackBar } from "./ui";

const LEHRSTELLEN_URL =
  "https://www.stadt.sg.ch/home/verwaltung-politik/arbeiten-fuer-stgallen/lehrstellen-stadt/informatiker.html";

/** Infos & Bewerbung – QR-Code zur offiziellen Lehrstellen-Seite, damit die
 *  Jugendlichen die Seite mit dem eigenen Handy scannen und mitnehmen können. */
export function Infos({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <BackBar title="Infos & Bewerbung" onBack={onBack} />
      <Card className="p-8 text-center sm:p-10">
        <div className="text-4xl">📲</div>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Lehre &amp; Bewerbung</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">
          Alle Infos zur Lehre als Informatiker/in Plattformentwicklung und wie du
          dich bewirbst. Scann den Code mit deinem Handy – dann hast du die Seite
          gleich dabei.
        </p>

        <div className="mt-7 flex justify-center">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/qr-informatiker.svg" alt="QR-Code zur Lehrstellen-Seite der Stadt St. Gallen" className="h-56 w-56" />
          </div>
        </div>

        <p className="mt-5 text-xs text-ink-soft">stadt.sg.ch · Lehrstellen · Informatiker/in</p>

        <div className="mt-6 flex justify-center">
          <Button onClick={() => window.open(LEHRSTELLEN_URL, "_blank", "noopener,noreferrer")}>
            Seite direkt öffnen →
          </Button>
        </div>
      </Card>
    </div>
  );
}
