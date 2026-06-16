"use client";

import { useState } from "react";
import { Card, Button, Brand } from "./ui";

export function Start({ onStart, onBack }: { onStart: (name: string) => void; onBack?: () => void }) {
  const [name, setName] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length >= 2) onStart(name.trim());
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <Brand />
        {onBack && (
          <button onClick={onBack} className="text-sm text-white/60 hover:text-white">
            ← Übersicht
          </button>
        )}
      </div>

      <Card className="p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-green">
          Berufswahl-Analyse
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-tight hyphens-auto break-words sm:text-4xl">
          Passt die Lehre als <span className="text-green">Plattform&shy;entwickler/in</span> zu dir?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Zuerst ein paar Fragen zu dir, dann ein Eignungs-Check zu
          berufsrelevanten Fähigkeiten – logisches Denken, strukturiertes
          Vorgehen und Urteilsvermögen aus unserem Arbeitsalltag. Am Ende siehst
          du, wie gut der Beruf zu dir passt. Dauert ca. 25 Minuten.
        </p>

        <form onSubmit={submit} className="mt-8">
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Wie heisst du? (Vorname genügt)
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Alex"
              autoComplete="off"
              className="w-full rounded-full border border-line bg-white px-5 py-3 text-base outline-none ring-green/30 focus:border-green focus:ring-4"
            />
            <Button type="submit" disabled={name.trim().length < 2} className="shrink-0">
              Los geht&apos;s →
            </Button>
          </div>
        </form>

        <p className="mt-6 rounded-2xl bg-green-soft px-4 py-3 text-sm leading-relaxed text-green-dark">
          🔒 Deine Daten werden ausschliesslich für die Schnuppertage verwendet und
          anschliessend gelöscht bzw. intern gespeichert. Erfasst werden nur dein
          Vorname und dein Ergebnis – keine Noten, keine Bewertung.
        </p>
      </Card>

      <p className="mt-6 text-center text-sm text-white/50">
        Informatikdienste Stadt St.&nbsp;Gallen · Schnuppertage
      </p>
    </div>
  );
}
