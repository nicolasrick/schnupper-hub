"use client";

import { useState } from "react";
import { Card, Button, Brand } from "./ui";

export function Start({ onStart, onBack }: { onStart: (vorname: string, nachname: string) => void; onBack?: () => void }) {
  const [name, setName] = useState("");
  const [nachname, setNachname] = useState("");
  const bereit = name.trim().length >= 2 && nachname.trim().length >= 2;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (bereit) onStart(name.trim(), nachname.trim());
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
          Vorgehen, IT-Sicherheit und Urteilsvermögen, wie sie in der IT gefragt
          sind. Am Ende siehst du, wie gut der Beruf zu dir passt. Dauert ca. 25 Minuten.
        </p>

        <form onSubmit={submit} className="mt-8">
          <label htmlFor="vorname" className="block text-sm font-medium text-ink">
            Wie heisst du?
          </label>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <input
              id="vorname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vorname"
              autoComplete="off"
              className="w-full rounded-full border border-line bg-white px-5 py-3 text-base outline-none ring-green/30 focus:border-green focus:ring-4"
            />
            <input
              id="nachname"
              value={nachname}
              onChange={(e) => setNachname(e.target.value)}
              placeholder="Nachname"
              autoComplete="off"
              className="w-full rounded-full border border-line bg-white px-5 py-3 text-base outline-none ring-green/30 focus:border-green focus:ring-4"
            />
          </div>
          <Button type="submit" disabled={!bereit} className="mt-3 w-full sm:w-auto">
            Los geht&apos;s →
          </Button>
        </form>

        <p className="mt-6 rounded-2xl bg-green-soft px-4 py-3 text-sm leading-relaxed text-green-dark">
          🔒 Deine Daten werden ausschliesslich für die Schnuppertage verwendet und
          anschliessend gelöscht bzw. intern gespeichert. Erfasst werden nur dein
          Name und dein Ergebnis – keine Noten, keine Bewertung.
        </p>
      </Card>

      <p className="mt-6 text-center text-sm text-white/50">
        Informatikdienste Stadt St.&nbsp;Gallen · Schnuppertage
      </p>
    </div>
  );
}
