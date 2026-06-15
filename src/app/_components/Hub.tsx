"use client";

import { useEffect, useState } from "react";
import { Brand } from "./ui";
import { modusById, STANDARD_MODUS, HubZiel } from "@/lib/modi";
import { api } from "@/lib/api";

export type { HubZiel } from "@/lib/modi";

const KARTEN: Record<HubZiel, { emoji: string; titel: string; text: string; cta: string; primary?: boolean }> = {
  analyse: {
    emoji: "🧭", titel: "Berufswahl-Analyse", cta: "Analyse starten",
    text: "Selbsttest, Mini-Aufgaben und ein ehrlicher Blick: Passt Plattformentwicklung zu dir?",
    primary: true,
  },
  mission: {
    emoji: "🚨", titel: "Mission: Einsatz IDS", cta: "Mission starten",
    text: "Die Stadt-IT ist ausgefallen! Löse die Einsätze, knacke den Code – und sichere dir deinen Rang.",
  },
  aufgaben: {
    emoji: "🗂️", titel: "Aufgaben & Downloads", cta: "Öffnen",
    text: "Alle Anleitungen und die Dateien zum Herunterladen – jederzeit griffbereit.",
  },
  zeitplan: {
    emoji: "🕐", titel: "Zeitplan", cta: "Öffnen",
    text: "Was läuft wann? Der Ablauf von Tag 1 und Tag 2 auf einen Blick.",
  },
  abgabe: {
    emoji: "📤", titel: "Dateien abgeben", cta: "Hochladen",
    text: "Lade deine Arbeiten hoch – dein:e Berufsbildner:in schaut sie sich an.",
  },
};

const FAKTEN = [
  { emoji: "🛠️", text: "Echtes Hands-on" },
  { emoji: "🎯", text: "Dein eigenes Fit-Profil" },
  { emoji: "🚀", text: "Bald: Team-Mission" },
];

export function Hub({ onNavigate }: { onNavigate: (z: HubZiel) => void }) {
  const [modusId, setModusId] = useState(STANDARD_MODUS);

  // Modus zentral vom Server lesen – und leicht pollen, damit eine Änderung
  // an EINER Stelle auf allen Geräten ankommt (ohne Reload).
  useEffect(() => {
    let aktiv = true;
    const lade = () => api.getModus().then((m) => { if (aktiv) setModusId(m); }).catch(() => {});
    lade();
    const iv = setInterval(lade, 15000);
    return () => { aktiv = false; clearInterval(iv); };
  }, []);

  const modus = modusById(modusId);
  const karten = modus.karten.map((z) => ({ ziel: z, ...KARTEN[z] }));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col">
      <div className="mb-6 flex justify-center">
        <Brand />
      </div>

      {/* Hero */}
      <div className="anim-in text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">
          {modus.emoji} {modus.label} · Plattformentwicklung
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-white sm:text-5xl">
          {modus.begruessung}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-white/70 sm:text-lg">
          {modus.intro}
        </p>
      </div>

      {/* Karten */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {karten.map((k, i) => (
          <button
            key={k.ziel}
            onClick={() => onNavigate(k.ziel)}
            className={
              "card-hover anim-in group flex flex-col items-start rounded-3xl p-7 text-left ring-1 " +
              (k.primary
                ? "bg-gradient-to-br from-green to-green-dark text-white ring-white/10 sm:col-span-2"
                : "bg-surface text-ink ring-black/5")
            }
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="flex w-full items-start justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-2xl">
                {k.emoji}
              </span>
              {k.primary && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  {modus.analyseDauer}
                </span>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-bold">{k.titel}</h2>
            <p className={"mt-1.5 leading-relaxed " + (k.primary ? "text-white/85" : "text-ink-soft")}>
              {k.text}
            </p>
            <span className={"mt-4 inline-flex items-center gap-1.5 text-sm font-semibold " + (k.primary ? "text-white" : "text-green")}>
              {k.cta}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </button>
        ))}
      </div>

      {/* Fakten-Leiste */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {FAKTEN.map((f) => (
          <span
            key={f.text}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/10"
          >
            <span>{f.emoji}</span>
            {f.text}
          </span>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-white/40">
        Informatikdienste der Stadt St. Gallen · Schnuppertage · Prototyp
      </p>
    </div>
  );
}
