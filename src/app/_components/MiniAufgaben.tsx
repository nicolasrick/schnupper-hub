"use client";

import { useState } from "react";
import {
  BIT_WERTE, BIT_ZIELE, TRIAGE, ZUORDNUNG, KUNDEN,
} from "@/lib/content";
import { Card, Button, StepDots } from "./ui";

export interface AufgabenErgebnis {
  bitUhr: boolean;
  triage: boolean;
  zuordnung: boolean;
}

export function MiniAufgaben({ onDone }: { onDone: (e: AufgabenErgebnis) => void }) {
  const [schritt, setSchritt] = useState(0); // 0 = Intro, 1..3 = Aufgaben
  const [ergebnis, setErgebnis] = useState<AufgabenErgebnis>({
    bitUhr: false, triage: false, zuordnung: false,
  });

  function weiter(key?: keyof AufgabenErgebnis, geloest?: boolean) {
    const next = key ? { ...ergebnis, [key]: geloest ?? ergebnis[key] } : ergebnis;
    if (key) setErgebnis(next);
    if (schritt >= 3) onDone(next);
    else setSchritt(schritt + 1);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {schritt > 0 && (
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-white/80">
            Aufgabe {schritt} von 3
          </span>
          <StepDots total={3} current={schritt - 1} />
        </div>
      )}

      {schritt === 0 && <Intro onNext={() => setSchritt(1)} />}
      {schritt === 1 && <BitUhr onNext={(ok) => weiter("bitUhr", ok)} />}
      {schritt === 2 && <Triage onNext={(ok) => weiter("triage", ok)} />}
      {schritt === 3 && <Zuordnung onNext={(ok) => weiter("zuordnung", ok)} />}
    </div>
  );
}

function Intro({ onNext }: { onNext: () => void }) {
  return (
    <Card className="p-8 text-center sm:p-10">
      <div className="text-5xl">🧩</div>
      <h2 className="mt-4 text-3xl font-bold">Jetzt wird getüftelt</h2>
      <p className="mx-auto mt-3 max-w-md text-lg leading-relaxed text-ink-soft">
        Drei kleine Aufgaben – echte Beispiele aus dem Alltag der
        Plattformentwicklung. Kein Stress: Ausprobieren ist erlaubt, hier zählt
        das Mitdenken.
      </p>
      <div className="mt-8 flex justify-center">
        <Button onClick={onNext}>Erste Aufgabe →</Button>
      </div>
    </Card>
  );
}

/* ---------- Aufgabe 1: Bit-Uhr ---------- */
function BitUhr({ onNext }: { onNext: (ok: boolean) => void }) {
  const [runde, setRunde] = useState(0);
  const [bits, setBits] = useState<boolean[]>(BIT_WERTE.map(() => false));
  const [status, setStatus] = useState<"offen" | "richtig" | "falsch">("offen");

  const ziel = BIT_ZIELE[runde];
  const summe = BIT_WERTE.reduce((s, w, i) => s + (bits[i] ? w : 0), 0);

  function toggle(i: number) {
    if (status === "richtig") return;
    const next = [...bits];
    next[i] = !next[i];
    setBits(next);
    setStatus("offen");
  }

  function pruefen() {
    if (summe === ziel.ziel) {
      setStatus("richtig");
    } else {
      setStatus("falsch");
    }
  }

  function weiter() {
    if (runde + 1 < BIT_ZIELE.length) {
      setRunde(runde + 1);
      setBits(BIT_WERTE.map(() => false));
      setStatus("offen");
    } else {
      onNext(true);
    }
  }

  return (
    <Card className="p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-green">
        Bit-Uhr · so rechnen Computer
      </p>
      <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Stelle die Zahl {ziel.ziel} ein</h2>
      <p className="mt-2 leading-relaxed text-ink-soft">
        Computer kennen nur «an» und «aus». Schalte die richtigen Lämpchen an –
        ihre Werte zusammengezählt sollen {ziel.ziel} ergeben.
      </p>

      <div className="mt-7 flex justify-center gap-2 sm:gap-3">
        {BIT_WERTE.map((w, i) => (
          <button
            key={w}
            onClick={() => toggle(i)}
            className={
              "flex w-14 flex-col items-center gap-2 rounded-2xl border-2 py-3 transition sm:w-16 " +
              (bits[i]
                ? "border-amber bg-amber/15"
                : "border-line bg-white hover:border-amber/40")
            }
          >
            <span
              className={
                "h-7 w-7 rounded-full transition " +
                (bits[i] ? "bg-amber shadow-[0_0_14px] shadow-amber/70" : "bg-black/10")
              }
            />
            <span className="text-sm font-bold tabular-nums text-ink">{w}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-lg">
        <span className="text-ink-soft">Summe:</span>
        <span
          className={
            "rounded-lg px-3 py-1 font-bold tabular-nums " +
            (status === "richtig" ? "bg-green-soft text-green-dark" : "bg-black/5 text-ink")
          }
        >
          {summe}
        </span>
      </div>

      {status === "falsch" && (
        <p className="mt-4 rounded-2xl bg-amber/10 px-4 py-3 text-center text-sm text-amber">
          Noch nicht ganz – {summe < ziel.ziel ? "es fehlt noch etwas." : "das ist zu viel."} Probier weiter!
        </p>
      )}
      {status === "richtig" && (
        <p className="mt-4 rounded-2xl bg-green-soft px-4 py-3 text-center text-sm text-green-dark">
          🎉 Perfekt! {BIT_WERTE.filter((_, i) => bits[i]).join(" + ")} = {ziel.ziel}. Genauso funktioniert das Binärsystem.
        </p>
      )}

      <div className="mt-7 flex justify-between">
        <span className="self-center text-sm text-ink-soft">{ziel.hinweis}</span>
        {status === "richtig" ? (
          <Button onClick={weiter}>
            {runde + 1 < BIT_ZIELE.length ? "Nächste Zahl →" : "Weiter →"}
          </Button>
        ) : (
          <Button onClick={pruefen} disabled={summe === 0}>Prüfen</Button>
        )}
      </div>
    </Card>
  );
}

/* ---------- Aufgabe 2: ServiceDesk-Triage ---------- */
function Triage({ onNext }: { onNext: (ok: boolean) => void }) {
  const [schritt, setSchritt] = useState(0);
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [fehlerfrei, setFehlerfrei] = useState(true);

  const aktuell = TRIAGE[schritt];
  const option = gewaehlt !== null ? aktuell.optionen[gewaehlt] : null;

  function waehle(i: number) {
    if (option?.richtig) return;
    setGewaehlt(i);
    if (!aktuell.optionen[i].richtig) setFehlerfrei(false);
  }

  function weiter() {
    if (schritt + 1 < TRIAGE.length) {
      setSchritt(schritt + 1);
      setGewaehlt(null);
    } else {
      onNext(fehlerfrei);
    }
  }

  return (
    <Card className="p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-green">
        ServiceDesk · einen Fall lösen
      </p>
      <h2 className="mt-2 text-2xl font-bold leading-snug sm:text-[28px]">{aktuell.frage}</h2>

      <div className="mt-6 grid gap-3">
        {aktuell.optionen.map((o, i) => {
          const istGewaehlt = gewaehlt === i;
          let cls = "border-line bg-white hover:border-green/50 hover:bg-green-soft/40";
          if (istGewaehlt && o.richtig) cls = "border-green bg-green-soft";
          else if (istGewaehlt && !o.richtig) cls = "border-amber bg-amber/10";
          return (
            <button
              key={i}
              onClick={() => waehle(i)}
              disabled={option?.richtig}
              className={"rounded-2xl border px-5 py-4 text-left text-base font-medium transition disabled:cursor-default " + cls}
            >
              {o.text}
            </button>
          );
        })}
      </div>

      {option && (
        <p
          className={
            "mt-4 rounded-2xl px-4 py-3 text-sm leading-relaxed " +
            (option.richtig ? "bg-green-soft text-green-dark" : "bg-amber/10 text-amber")
          }
        >
          {option.richtig ? "✅ " : "💡 "}
          {option.feedback}
        </p>
      )}

      {option?.richtig && (
        <div className="mt-6 flex justify-end">
          <Button onClick={weiter}>
            {schritt + 1 < TRIAGE.length ? "Nächster Schritt →" : "Weiter →"}
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ---------- Aufgabe 3: Gerät/Auftrag → Kunde ---------- */
function Zuordnung({ onNext }: { onNext: (ok: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [fehlerfrei, setFehlerfrei] = useState(true);

  const aktuell = ZUORDNUNG[idx];
  const richtig = gewaehlt === aktuell.richtig;

  function waehle(k: string) {
    if (gewaehlt === aktuell.richtig) return;
    setGewaehlt(k);
    if (k !== aktuell.richtig) setFehlerfrei(false);
  }

  function weiter() {
    if (idx + 1 < ZUORDNUNG.length) {
      setIdx(idx + 1);
      setGewaehlt(null);
    } else {
      onNext(fehlerfrei);
    }
  }

  return (
    <Card className="p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-green">
        Unsere Kundschaft · die ganze Stadt
      </p>
      <h2 className="mt-2 text-2xl font-bold leading-snug sm:text-[28px]">
        Welche Kundin passt zu diesem Auftrag?
      </h2>
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 text-base font-medium text-ink">
        «{aktuell.auftrag}»
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {KUNDEN.map((k) => {
          const istGewaehlt = gewaehlt === k;
          let cls = "border-line bg-white hover:border-green/50";
          if (istGewaehlt && richtig) cls = "border-green bg-green-soft text-green-dark";
          else if (istGewaehlt && !richtig) cls = "border-amber bg-amber/10 text-amber";
          else if (richtig && k === aktuell.richtig) cls = "border-green bg-green-soft text-green-dark";
          return (
            <button
              key={k}
              onClick={() => waehle(k)}
              disabled={richtig}
              className={"rounded-full border px-5 py-2.5 text-base font-medium transition disabled:cursor-default " + cls}
            >
              {k}
            </button>
          );
        })}
      </div>

      {gewaehlt && (
        <p
          className={
            "mt-5 rounded-2xl px-4 py-3 text-sm leading-relaxed " +
            (richtig ? "bg-green-soft text-green-dark" : "bg-amber/10 text-amber")
          }
        >
          {richtig ? "✅ " : "💡 "}
          {richtig ? aktuell.erklaerung : "Nicht ganz – versuch es nochmal."}
        </p>
      )}

      {richtig && (
        <div className="mt-6 flex justify-end">
          <Button onClick={weiter}>
            {idx + 1 < ZUORDNUNG.length ? "Nächster Auftrag →" : "Fast geschafft →"}
          </Button>
        </div>
      )}
    </Card>
  );
}
