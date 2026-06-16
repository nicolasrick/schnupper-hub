"use client";

import { useState } from "react";
import {
  MISSION_STORY, EINSAETZE, BIT_WERTE, MASTER_CODE, MAX_PUNKTE,
  punkteFuer, rangFuer, EinsatzTriage, EinsatzQuiz, EinsatzBinaer, EinsatzCode, EinsatzMatching,
} from "@/lib/mission";
import { Card, Button, BackBar, StepDots } from "./ui";
import { Confetti } from "./Confetti";

export function Mission({ onBack }: { onBack: () => void }) {
  // 0 = Intro, 1..N = Einsätze, N+1 = Finale
  const [schritt, setSchritt] = useState(0);
  const [punkte, setPunkte] = useState(0);
  const [fragmente, setFragmente] = useState<string[]>([]);

  function loese(p: number, fragment: string) {
    setPunkte((x) => x + p);
    setFragmente((f) => [...f, fragment]);
    setSchritt((s) => s + 1);
  }

  const total = EINSAETZE.length;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <BackBar title="Einsatz IDS" onBack={onBack} />

      {schritt > 0 && schritt <= total && (
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-white/80">Einsatz {schritt} von {total}</span>
          <StepDots total={total} current={schritt - 1} />
        </div>
      )}

      {schritt === 0 && <Intro onStart={() => setSchritt(1)} />}

      {EINSAETZE.map((e, i) => {
        if (schritt !== i + 1) return null;
        const solve = (p: number) => loese(p, e.fragment);
        if (e.typ === "triage") return <TriageView key={e.nr} e={e} onSolve={solve} />;
        if (e.typ === "quiz") return <QuizView key={e.nr} e={e} onSolve={solve} />;
        if (e.typ === "binaer") return <BinaerView key={e.nr} e={e} onSolve={solve} />;
        if (e.typ === "code") return <CodeView key={e.nr} e={e} onSolve={solve} />;
        return <MatchingView key={e.nr} e={e} onSolve={solve} />;
      })}

      {schritt === total + 1 && <MasterCode fragmente={fragmente} onDone={() => setSchritt(total + 2)} />}

      {schritt === total + 2 && <Finale punkte={punkte} onBack={onBack} />}
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <Card className="p-8 text-center sm:p-10">
      <div className="text-5xl">🚨</div>
      <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-green">{MISSION_STORY.kicker}</p>
      <h2 className="mt-1 text-3xl font-bold sm:text-4xl">{MISSION_STORY.titel}</h2>
      <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-soft">{MISSION_STORY.intro}</p>
      <div className="mt-8 flex justify-center">
        <Button onClick={onStart}>Einsatz starten →</Button>
      </div>
    </Card>
  );
}

function Fragment({ frag }: { frag: string }) {
  return (
    <p className="mt-4 rounded-2xl bg-green-soft px-4 py-3 text-center text-sm font-semibold text-green-dark">
      🔓 Code-Fragment freigeschaltet: <span className="text-lg tabular-nums">{frag}</span>
    </p>
  );
}

/* ---------- Einsatz 1: Triage ---------- */
function TriageView({ e, onSolve }: { e: EinsatzTriage; onSolve: (p: number) => void }) {
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [fehler, setFehler] = useState(0);
  const option = gewaehlt !== null ? e.optionen[gewaehlt] : null;
  const geloest = option?.richtig ?? false;

  function waehle(i: number) {
    if (geloest) return;
    setGewaehlt(i);
    if (!e.optionen[i].richtig) setFehler((f) => f + 1);
  }

  return (
    <Card className="p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-green">Einsatz {e.nr} · {e.titel}</p>
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <h2 className="mt-4 text-2xl font-bold">{e.frage}</h2>
      <div className="mt-5 grid gap-3">
        {e.optionen.map((o, i) => {
          const sel = gewaehlt === i;
          let cls = "border-line bg-white hover:border-green/50 hover:bg-green-soft/40";
          if (sel && o.richtig) cls = "border-green bg-green-soft";
          else if (sel && !o.richtig) cls = "border-amber bg-amber/10";
          return (
            <button key={i} onClick={() => waehle(i)} disabled={geloest}
              className={"rounded-2xl border px-5 py-4 text-left text-base font-medium transition disabled:cursor-default " + cls}>
              {o.text}
            </button>
          );
        })}
      </div>
      {option && (
        <p className={"mt-4 rounded-2xl px-4 py-3 text-sm leading-relaxed " + (option.richtig ? "bg-green-soft text-green-dark" : "bg-amber/10 text-amber")}>
          {option.richtig ? "✅ " : "💡 "}{option.feedback}
        </p>
      )}
      {geloest && (
        <>
          <Fragment frag={e.fragment} />
          <div className="mt-5 flex justify-end">
            <Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button>
          </div>
        </>
      )}
    </Card>
  );
}

/* ---------- Einsatz 2: Binär ---------- */
function BinaerView({ e, onSolve }: { e: EinsatzBinaer; onSolve: (p: number) => void }) {
  const [bits, setBits] = useState<boolean[]>(BIT_WERTE.map(() => false));
  const [status, setStatus] = useState<"offen" | "richtig" | "falsch">("offen");
  const [fehler, setFehler] = useState(0);
  const summe = BIT_WERTE.reduce((s, w, i) => s + (bits[i] ? w : 0), 0);

  function toggle(i: number) {
    if (status === "richtig") return;
    setBits((prev) => prev.map((b, j) => (j === i ? !b : b)));
    setStatus("offen");
  }
  function pruefen() {
    if (summe === e.ziel) setStatus("richtig");
    else { setStatus("falsch"); setFehler((f) => f + 1); }
  }

  return (
    <Card className="p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-green">Einsatz {e.nr} · {e.titel}</p>
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <h2 className="mt-4 text-2xl font-bold">Stelle den Code {e.ziel} ein</h2>
      <div className="mt-6 flex justify-center gap-2 sm:gap-3">
        {BIT_WERTE.map((w, i) => (
          <button key={w} onClick={() => toggle(i)}
            className={"flex w-14 flex-col items-center gap-2 rounded-2xl border-2 py-3 transition sm:w-16 " + (bits[i] ? "border-amber bg-amber/15" : "border-line bg-white hover:border-amber/40")}>
            <span className={"h-7 w-7 rounded-full transition " + (bits[i] ? "bg-amber shadow-[0_0_14px] shadow-amber/70" : "bg-black/10")} />
            <span className="text-sm font-bold tabular-nums text-ink">{w}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 text-lg">
        <span className="text-ink-soft">Summe:</span>
        <span className={"rounded-lg px-3 py-1 font-bold tabular-nums " + (status === "richtig" ? "bg-green-soft text-green-dark" : "bg-black/5 text-ink")}>{summe}</span>
      </div>
      {status === "falsch" && <p className="mt-4 rounded-2xl bg-amber/10 px-4 py-3 text-center text-sm text-amber">Noch nicht – {summe < e.ziel ? "es fehlt etwas." : "zu viel."} Weiter tüfteln!</p>}
      {status === "richtig" && <Fragment frag={e.fragment} />}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-ink-soft">{e.hinweis}</span>
        {status === "richtig"
          ? <Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button>
          : <Button onClick={pruefen} disabled={summe === 0}>Prüfen</Button>}
      </div>
    </Card>
  );
}

/* ---------- Einsatz 3: Matching ---------- */
function MatchingView({ e, onSolve }: { e: EinsatzMatching; onSolve: (p: number) => void }) {
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [fehler, setFehler] = useState(0);
  const geloest = gewaehlt === e.richtig;

  function waehle(k: string) {
    if (geloest) return;
    setGewaehlt(k);
    if (k !== e.richtig) setFehler((f) => f + 1);
  }

  return (
    <Card className="p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-green">Einsatz {e.nr} · {e.titel}</p>
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <p className="mt-4 rounded-2xl bg-amber/10 px-4 py-3 text-base font-medium text-ink">{e.auftrag}</p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {e.optionen.map((k) => {
          const sel = gewaehlt === k;
          let cls = "border-line bg-white hover:border-green/50";
          if (sel && geloest) cls = "border-green bg-green-soft text-green-dark";
          else if (sel && !geloest) cls = "border-amber bg-amber/10 text-amber";
          else if (geloest && k === e.richtig) cls = "border-green bg-green-soft text-green-dark";
          return (
            <button key={k} onClick={() => waehle(k)} disabled={geloest}
              className={"rounded-full border px-5 py-2.5 text-base font-medium transition disabled:cursor-default " + cls}>
              {k}
            </button>
          );
        })}
      </div>
      {gewaehlt && (
        <p className={"mt-5 rounded-2xl px-4 py-3 text-sm leading-relaxed " + (geloest ? "bg-green-soft text-green-dark" : "bg-amber/10 text-amber")}>
          {geloest ? "✅ " + e.erklaerung : "💡 Nicht ganz – versuch es nochmal."}
        </p>
      )}
      {geloest && (
        <>
          <Fragment frag={e.fragment} />
          <div className="mt-5 flex justify-end">
            <Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button>
          </div>
        </>
      )}
    </Card>
  );
}

/* ---------- Quiz (Multiple Choice) ---------- */
function QuizView({ e, onSolve }: { e: EinsatzQuiz; onSolve: (p: number) => void }) {
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [fehler, setFehler] = useState(0);
  const geloest = gewaehlt !== null && e.optionen[gewaehlt].richtig;

  function waehle(i: number) {
    if (geloest) return;
    setGewaehlt(i);
    if (!e.optionen[i].richtig) setFehler((f) => f + 1);
  }

  return (
    <Card className="p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-green">Einsatz {e.nr} · {e.titel}</p>
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <h2 className="mt-4 text-2xl font-bold">{e.frage}</h2>
      <div className="mt-5 grid gap-3">
        {e.optionen.map((o, i) => {
          const sel = gewaehlt === i;
          let cls = "border-line bg-white hover:border-green/50 hover:bg-green-soft/40";
          if (sel && o.richtig) cls = "border-green bg-green-soft";
          else if (sel && !o.richtig) cls = "border-amber bg-amber/10";
          return (
            <button key={i} onClick={() => waehle(i)} disabled={geloest}
              className={"rounded-2xl border px-5 py-4 text-left text-base font-medium transition disabled:cursor-default " + cls}>
              {o.text}
            </button>
          );
        })}
      </div>
      {geloest && <p className="mt-4 rounded-2xl bg-green-soft px-4 py-3 text-sm leading-relaxed text-green-dark">✅ {e.aufloesung}</p>}
      {gewaehlt !== null && !geloest && <p className="mt-4 rounded-2xl bg-amber/10 px-4 py-3 text-sm text-amber">Nicht ganz – probier nochmal.</p>}
      {geloest && (
        <>
          <Fragment frag={e.fragment} />
          <div className="mt-5 flex justify-end"><Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button></div>
        </>
      )}
    </Card>
  );
}

/* ---------- Datei finden (Code eingeben) ---------- */
function CodeView({ e, onSolve }: { e: EinsatzCode; onSolve: (p: number) => void }) {
  const [wert, setWert] = useState("");
  const [status, setStatus] = useState<"offen" | "richtig" | "falsch">("offen");
  const [fehler, setFehler] = useState(0);

  function pruefen() {
    const v = wert.trim().toLowerCase();
    if (v.length > 0 && e.loesung.some((l) => l.toLowerCase() === v)) setStatus("richtig");
    else { setStatus("falsch"); setFehler((f) => f + 1); }
  }

  return (
    <Card className="p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-green">Einsatz {e.nr} · {e.titel}</p>
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <h2 className="mt-4 text-2xl font-bold leading-snug">{e.frage}</h2>
      <input
        value={wert}
        onChange={(ev) => { setWert(ev.target.value); setStatus("offen"); }}
        placeholder="Codewort eingeben"
        disabled={status === "richtig"}
        className="mt-5 w-full rounded-2xl border border-line px-5 py-3 text-lg outline-none focus:border-green focus:ring-4 focus:ring-green/20"
      />
      {status === "falsch" && <p className="mt-3 rounded-2xl bg-amber/10 px-4 py-3 text-sm text-amber">Noch nicht gefunden. Tipp: {e.hinweis}</p>}
      {status === "richtig" && <Fragment frag={e.fragment} />}
      <div className="mt-5 flex justify-end">
        {status === "richtig"
          ? <Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button>
          : <Button onClick={pruefen} disabled={wert.trim().length === 0}>Prüfen</Button>}
      </div>
    </Card>
  );
}

/* ---------- Master-Code zusammensetzen ---------- */
function MasterCode({ fragmente, onDone }: { fragmente: string[]; onDone: () => void }) {
  const [wert, setWert] = useState("");
  const [falsch, setFalsch] = useState(0);

  function pruefen() {
    if (wert.trim().toUpperCase() === MASTER_CODE) onDone();
    else setFalsch((f) => f + 1);
  }

  return (
    <Card className="p-8 text-center sm:p-10">
      <div className="text-4xl">🧩</div>
      <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Setz den Master-Code zusammen</h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">
        Du hast aus jedem Einsatz ein Code-Fragment. Setz sie in der richtigen
        Reihenfolge zusammen und gib den Master-Code ein – damit fährst du die
        Systeme der Stadt wieder hoch.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {fragmente.map((f, i) => (
          <span key={i} className="grid h-12 w-12 place-items-center rounded-xl border-2 border-green bg-green-soft text-2xl font-bold text-green-dark">
            {f}
          </span>
        ))}
      </div>
      <input
        value={wert}
        onChange={(e) => { setWert(e.target.value.toUpperCase()); }}
        placeholder="MASTER-CODE"
        className="mt-6 w-full max-w-xs rounded-2xl border border-line px-5 py-3 text-center text-xl font-bold tracking-[0.3em] outline-none focus:border-green focus:ring-4 focus:ring-green/20"
      />
      {falsch > 0 && (
        <p className="mt-3 text-sm text-amber">
          Noch nicht. {falsch >= 2 ? "Tipp: Lies die Kacheln von links nach rechts." : "Schau die Fragmente nochmal an."}
        </p>
      )}
      <div className="mt-6 flex justify-center">
        <Button onClick={pruefen} disabled={wert.trim().length === 0}>Stadt wieder online bringen →</Button>
      </div>
    </Card>
  );
}

/* ---------- Finale ---------- */
function Finale({ punkte, onBack }: { punkte: number; onBack: () => void }) {
  const rang = rangFuer(punkte);
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Confetti />
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-green to-green-dark px-8 py-10 text-center text-white sm:px-10">
          <div className="text-5xl">✅</div>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Stadt wieder online!</h2>
          <p className="mt-3 text-white/90">
            Master-Code <span className="font-bold tabular-nums">{MASTER_CODE}</span> eingegeben – alle Systeme laufen wieder. Stark!
          </p>
        </div>
        <div className="space-y-5 px-8 py-8 text-center sm:px-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line p-5">
              <div className="text-3xl font-bold text-green tabular-nums">{punkte}<span className="text-lg text-ink-soft">/{MAX_PUNKTE}</span></div>
              <div className="mt-1 text-xs text-ink-soft">Punkte</div>
            </div>
            <div className="rounded-2xl border border-line p-5">
              <div className="text-3xl">{rang.emoji}</div>
              <div className="mt-1 text-sm font-semibold text-ink">{rang.titel}</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">
            Dein Rang kann in deine Schnupperauswertung übernommen werden. Zeig ihn deiner Berufsbildnerin / deinem Berufsbildner!
          </p>
          <div className="flex justify-center pt-1">
            <Button variant="ghost" onClick={onBack}>Zur Übersicht →</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
