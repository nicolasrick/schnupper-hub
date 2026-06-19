"use client";

import { useEffect, useState } from "react";
import { auswerten, Auswertung } from "@/lib/content";
import { api } from "@/lib/api";
import { Start } from "./Start";
import { Selbsttest } from "./Selbsttest";
import { FitProfil } from "./FitProfil";
import { EignungsCheck, AufgabenErgebnis } from "./EignungsCheck";
import { Abschluss } from "./Abschluss";
import { Card, Button, Brand } from "./ui";

type Schritt = "start" | "test" | "profil" | "aufgaben" | "abschluss";

// Fortschritt liegt LOKAL im Browser (localStorage). Übersteht Reload, Tab-
// schliessen und Internet-Verlust → der Stift macht dort weiter, wo er war.
const LS_KEY = "schnupper_analyse_fortschritt";
const LS_TTL = 12 * 3_600_000; // 12 h – danach gilt der Stand als veraltet.

type Gespeichert = {
  schritt: Schritt;
  name: string;
  nachname: string;
  auswertung: Auswertung | null;
  aufgaben: AufgabenErgebnis | null;
  savedAt: number;
};

/** Die geführte Berufswahl-Analyse. Der Fortschritt wird lokal gesichert
 *  (Resume); ans Dashboard geht am Ende nur Name + Kennzahlen. */
export function AnalyseFlow({ onExit }: { onExit: () => void }) {
  const [schritt, setSchritt] = useState<Schritt>("start");
  const [name, setName] = useState("");
  const [nachname, setNachname] = useState("");
  const [auswertung, setAuswertung] = useState<Auswertung | null>(null);
  const [aufgaben, setAufgaben] = useState<AufgabenErgebnis | null>(null);

  const [geladen, setGeladen] = useState(false);
  const [resume, setResume] = useState<Gespeichert | null>(null);

  // Beim Start prüfen, ob ein unfertiger Stand vorliegt.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const g = JSON.parse(raw) as Gespeichert;
        const frisch = g && typeof g.savedAt === "number" && Date.now() - g.savedAt < LS_TTL;
        const unfertig = g?.schritt && g.schritt !== "start" && g.schritt !== "abschluss";
        if (frisch && unfertig) setResume(g);
        else localStorage.removeItem(LS_KEY);
      }
    } catch {}
    setGeladen(true);
  }, []);

  // Stand fortlaufend sichern. Bei «abschluss» (fertig + abgeschickt) wieder löschen.
  useEffect(() => {
    if (!geladen) return;
    try {
      if (schritt === "start") return;
      if (schritt === "abschluss") {
        localStorage.removeItem(LS_KEY);
        return;
      }
      const g: Gespeichert = { schritt, name, nachname, auswertung, aufgaben, savedAt: Date.now() };
      localStorage.setItem(LS_KEY, JSON.stringify(g));
    } catch {}
  }, [geladen, schritt, name, nachname, auswertung, aufgaben]);

  function weitermachen() {
    if (!resume) return;
    setName(resume.name);
    setNachname(resume.nachname);
    setAuswertung(resume.auswertung);
    setAufgaben(resume.aufgaben);
    setSchritt(resume.schritt);
    setResume(null);
  }
  function neuStarten() {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setResume(null);
  }

  // Erst rendern, wenn localStorage geprüft ist → kein Flackern Start→Resume.
  if (!geladen) return null;

  if (resume) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <Brand />
          <button onClick={onExit} className="text-sm text-white/60 hover:text-white">← Übersicht</button>
        </div>
        <Card className="p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-green">Willkommen zurück</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
            Hallo {resume.name}! Möchtest du weitermachen?
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Wir haben deinen Stand gespeichert. Du kannst genau dort weitermachen,
            wo du aufgehört hast – nichts ist verloren.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={weitermachen} className="w-full sm:w-auto">Weitermachen →</Button>
            <button
              onClick={neuStarten}
              className="rounded-full border border-line px-6 py-3 text-base font-medium text-ink-soft transition hover:border-green hover:text-green"
            >
              Neu anfangen
            </button>
          </div>
          <p className="mt-6 text-sm text-ink-soft/70">
            Tipp: «Neu anfangen» nur, wenn du nicht {resume.name} bist.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      {schritt === "start" && (
        <Start onStart={(n, nn) => { setName(n); setNachname(nn); setSchritt("test"); }} onBack={onExit} />
      )}

      {schritt === "test" && (
        <Selbsttest
          name={name}
          onDone={(antworten) => { setAuswertung(auswerten(antworten)); setSchritt("profil"); }}
        />
      )}

      {schritt === "profil" && auswertung && (
        <FitProfil name={name} auswertung={auswertung} onNext={() => setSchritt("aufgaben")} />
      )}

      {schritt === "aufgaben" && (
        <EignungsCheck
          onDone={(e) => {
            setAufgaben(e);
            setSchritt("abschluss");
            // Minimiertes Ergebnis an den Server (Name + Kennzahlen) – fürs Dashboard.
            if (auswertung) {
              api.saveErgebnis({
                vorname: name,
                nachname,
                passung: auswertung.passung,
                topFeld: auswertung.staerken[0]?.dim.label ?? "",
                selbststaendig: e.selbststaendig,
                total: e.total,
                tipps: e.tipps,
                starkeTeile: e.starkeTeile,
                bonusGemacht: e.bonusGemacht,
                bonusSelbststaendig: e.bonusSelbststaendig,
                bonusTotal: e.bonusTotal,
              });
            }
          }}
        />
      )}

      {schritt === "abschluss" && auswertung && aufgaben && (
        <Abschluss name={name} auswertung={auswertung} aufgaben={aufgaben} onRestart={onExit} />
      )}
    </>
  );
}
