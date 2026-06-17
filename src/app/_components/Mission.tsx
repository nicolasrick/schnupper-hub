"use client";

import { useEffect, useState } from "react";
import {
  MISSION_STORY, BIT_WERTE, punkteFuer, rangFuer, speedBadge, zeitText,
  playlistFuerModus, einsatzAnzahl, maxPunkte,
  EinsatzTriage, EinsatzQuiz, EinsatzBinaer, EinsatzCode, EinsatzMatching,
  EinsatzCipher, EinsatzFehler, EinsatzSequenz, BeatSchritt, Playlist,
} from "@/lib/mission";
import { api } from "@/lib/api";
import { Card, Button, BackBar, StepDots } from "./ui";
import { Confetti } from "./Confetti";

interface TeamInfo { team: boolean; name: string; }

export function Mission({ onBack }: { onBack: () => void }) {
  // Modus zentral vom Server lesen – entscheidet über Länge/Schwierigkeit.
  const [modusId, setModusId] = useState<string | null>(null);
  useEffect(() => {
    let aktiv = true;
    api.getModus().then((m) => { if (aktiv) setModusId(m); }).catch(() => { if (aktiv) setModusId("schnuppertag"); });
    return () => { aktiv = false; };
  }, []);

  const pl: Playlist = playlistFuerModus(modusId);
  const N = pl.schritte.length;
  const total = einsatzAnzahl(pl);
  const max = maxPunkte(pl);

  // 0 = Intro, 1..N = Schritte, N+1 = Master-Code, N+2 = Finale
  const [schritt, setSchritt] = useState(0);
  const [punkte, setPunkte] = useState(0);
  const [fragmente, setFragmente] = useState<string[]>([]);
  const [sekunden, setSekunden] = useState(0);
  const [info, setInfo] = useState<TeamInfo>({ team: false, name: "" });

  // Einsatz-Timer – läuft ab dem Start bis zum Finale (Zeitdruck als Würze).
  useEffect(() => {
    if (schritt < 1 || schritt >= N + 2) return;
    const t = setInterval(() => setSekunden((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [schritt, N]);

  function loeseEinsatz(p: number, fragment: string) {
    setPunkte((x) => x + p);
    setFragmente((f) => [...f, fragment]);
    setSchritt((s) => s + 1);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <BackBar title="Einsatz IDS" onBack={onBack} />

      {schritt > 0 && schritt <= N && (
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-white/80">
            Einsatz {Math.min(fragmente.length + 1, total)} von {total}
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold tabular-nums text-white/80">
              ⏱ {zeitText(sekunden)}
            </span>
            <StepDots total={total} current={fragmente.length} />
          </div>
        </div>
      )}

      {schritt === 0 && <Intro modusId={modusId} onStart={(t) => { setInfo(t); setSchritt(1); }} />}

      {pl.schritte.map((s, i) => {
        if (schritt !== i + 1) return null;
        if (s.kind === "beat") return <BeatView key={"beat" + i} s={s} onWeiter={() => setSchritt(schritt + 1)} />;
        const ein = s.einsatz;
        const solve = (p: number) => loeseEinsatz(p, s.fragment);
        const frag = s.fragment;
        if (ein.typ === "triage") return <TriageView key={ein.id} e={ein} frag={frag} onSolve={solve} />;
        if (ein.typ === "quiz") return <QuizView key={ein.id} e={ein} frag={frag} onSolve={solve} />;
        if (ein.typ === "binaer") return <BinaerView key={ein.id} e={ein} frag={frag} onSolve={solve} />;
        if (ein.typ === "code") return <CodeView key={ein.id} e={ein} frag={frag} onSolve={solve} />;
        if (ein.typ === "cipher") return <CipherView key={ein.id} e={ein} frag={frag} onSolve={solve} />;
        if (ein.typ === "fehler") return <FehlerView key={ein.id} e={ein} frag={frag} onSolve={solve} />;
        if (ein.typ === "sequenz") return <SequenzView key={ein.id} e={ein} frag={frag} onSolve={solve} />;
        return <MatchingView key={ein.id} e={ein} frag={frag} onSolve={solve} />;
      })}

      {schritt === N + 1 && (
        <MasterCode fragmente={fragmente} wort={pl.masterWort} onDone={() => setSchritt(N + 2)} />
      )}

      {schritt === N + 2 && (
        <Finale punkte={punkte} max={max} sekunden={sekunden} einsaetze={total}
          wort={pl.masterWort} info={info} onBack={onBack} />
      )}
    </div>
  );
}

/* ---------- Intro (mit Solo/Team-Wahl) ---------- */
function Intro({ modusId, onStart }: { modusId: string | null; onStart: (t: TeamInfo) => void }) {
  const kurz = modusId === "zukunftstag";
  return (
    <Card className="p-8 text-center sm:p-10">
      <div className="text-5xl">🚨</div>
      <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-green">{MISSION_STORY.kicker}</p>
      <h2 className="mt-1 text-3xl font-bold sm:text-4xl">{MISSION_STORY.titel}</h2>
      <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-soft">{MISSION_STORY.intro}</p>

      <p className="mt-6 text-xs text-ink-soft">{kurz ? "Kurz-Einsatz · ca. 10 Min" : "Voll-Einsatz · 8 Aufträge · 1 davon vor Ort (Rundgang)"}</p>
      <div className="mt-6 flex justify-center">
        <Button onClick={() => onStart({ team: false, name: "" })}>Einsatz starten →</Button>
      </div>
    </Card>
  );
}

/* ---------- Story-Beat (Erzähl-Zwischenstopp) ---------- */
function BeatView({ s, onWeiter }: { s: BeatSchritt; onWeiter: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-green to-green-dark px-8 py-10 text-center text-white sm:px-10">
        <div className="text-5xl">{s.emoji}</div>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{s.titel}</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-white/90">{s.text}</p>
        <div className="mt-7 flex justify-center">
          <Button variant="ghost" className="bg-white/15 text-white hover:bg-white/25 hover:text-white" onClick={onWeiter}>
            Weiter →
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* Wiederkehrender Fragment-Hinweis nach gelöstem Einsatz */
function Fragment({ frag }: { frag: string }) {
  return (
    <div className="pop mt-4 rounded-2xl bg-green-soft px-4 py-3 text-center text-green-dark">
      <p className="text-sm font-semibold">
        🔓 Code-Fragment freigeschaltet: <span className="text-2xl tabular-nums">{frag}</span>
      </p>
      <p className="mt-1 text-xs">✍️ Schreib diesen Buchstaben auf deinen Block – du brauchst ihn am Schluss!</p>
    </div>
  );
}

/* Kopfzeile jedes Einsatzes */
function Kopf({ titel }: { titel: string }) {
  return <p className="text-sm font-semibold uppercase tracking-wide text-green">{titel}</p>;
}

/* ---------- Triage ---------- */
function TriageView({ e, frag, onSolve }: { e: EinsatzTriage; frag: string; onSolve: (p: number) => void }) {
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
      <Kopf titel={e.titel} />
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
          <Fragment frag={frag} />
          <div className="mt-5 flex justify-end"><Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button></div>
        </>
      )}
    </Card>
  );
}

/* ---------- Binär (auch Binär→Buchstabe) ---------- */
function BinaerView({ e, frag, onSolve }: { e: EinsatzBinaer; frag: string; onSolve: (p: number) => void }) {
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
      <Kopf titel={e.titel} />
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <h2 className="mt-4 text-2xl font-bold">
        {e.buchstabe ? `Stell die Stelle von «${e.buchstabe}» als Bit-Code ein` : `Stelle den Code ${e.ziel} ein`}
      </h2>
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
      {status === "richtig" && <Fragment frag={frag} />}
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-sm text-ink-soft">{e.hinweis}</span>
        {status === "richtig"
          ? <Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button>
          : <Button onClick={pruefen} disabled={summe === 0}>Prüfen</Button>}
      </div>
    </Card>
  );
}

/* ---------- Matching ---------- */
function MatchingView({ e, frag, onSolve }: { e: EinsatzMatching; frag: string; onSolve: (p: number) => void }) {
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
      <Kopf titel={e.titel} />
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
          <Fragment frag={frag} />
          <div className="mt-5 flex justify-end"><Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button></div>
        </>
      )}
    </Card>
  );
}

/* ---------- Quiz ---------- */
function QuizView({ e, frag, onSolve }: { e: EinsatzQuiz; frag: string; onSolve: (p: number) => void }) {
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
      <Kopf titel={e.titel} />
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
          <Fragment frag={frag} />
          <div className="mt-5 flex justify-end"><Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button></div>
        </>
      )}
    </Card>
  );
}

/* ---------- Datei finden (Code eingeben) ---------- */
function CodeView({ e, frag, onSolve }: { e: EinsatzCode; frag: string; onSolve: (p: number) => void }) {
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
      <Kopf titel={e.titel} />
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
      {status === "richtig" && <Fragment frag={frag} />}
      <div className="mt-5 flex justify-end">
        {status === "richtig"
          ? <Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button>
          : <Button onClick={pruefen} disabled={wert.trim().length === 0}>Prüfen</Button>}
      </div>
    </Card>
  );
}

/* ---------- Caesar-Geheimschrift ---------- */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function CipherView({ e, frag, onSolve }: { e: EinsatzCipher; frag: string; onSolve: (p: number) => void }) {
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
      <Kopf titel={e.titel} />
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <h2 className="mt-4 text-xl font-bold leading-snug">{e.frage}</h2>
      <div className="mt-4 flex justify-center gap-1.5 sm:gap-2">
        {e.chiffre.split("").map((c, i) => (
          <span key={i} className="grid h-12 w-9 place-items-center rounded-lg border-2 border-line bg-black/5 font-mono text-2xl font-bold text-ink sm:h-14 sm:w-11">
            {c}
          </span>
        ))}
      </div>
      {/* Alphabet-Leiste als Hilfe */}
      <div className="mt-4 overflow-x-auto">
        <div className="mx-auto flex w-max gap-0.5 rounded-xl bg-black/5 p-1.5 font-mono text-[11px] text-ink-soft">
          {ALPHABET.map((a) => (
            <span key={a} className="grid h-5 w-5 place-items-center tabular-nums">{a}</span>
          ))}
        </div>
      </div>
      <input
        value={wert}
        onChange={(ev) => { setWert(ev.target.value); setStatus("offen"); }}
        placeholder="Entschlüsseltes Wort"
        disabled={status === "richtig"}
        className="mt-5 w-full rounded-2xl border border-line px-5 py-3 text-lg uppercase tracking-widest outline-none focus:border-green focus:ring-4 focus:ring-green/20"
      />
      {status === "falsch" && <p className="mt-3 rounded-2xl bg-amber/10 px-4 py-3 text-sm text-amber">Noch nicht. Tipp: {e.hinweis}</p>}
      {status === "richtig" && <Fragment frag={frag} />}
      <div className="mt-5 flex justify-end">
        {status === "richtig"
          ? <Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button>
          : <Button onClick={pruefen} disabled={wert.trim().length === 0}>Entschlüsseln</Button>}
      </div>
    </Card>
  );
}

/* ---------- Fehler im Befehl finden ---------- */
function FehlerView({ e, frag, onSolve }: { e: EinsatzFehler; frag: string; onSolve: (p: number) => void }) {
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [fehler, setFehler] = useState(0);
  const geloest = gewaehlt !== null && e.zeilen[gewaehlt].defekt;

  function waehle(i: number) {
    if (geloest) return;
    setGewaehlt(i);
    if (!e.zeilen[i].defekt) setFehler((f) => f + 1);
  }

  return (
    <Card className="p-8 sm:p-10">
      <Kopf titel={e.titel} />
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <h2 className="mt-4 text-2xl font-bold">{e.frage}</h2>
      <div className="mt-5 grid gap-2.5 rounded-2xl bg-[#1a1a1a] p-4">
        {e.zeilen.map((z, i) => {
          const sel = gewaehlt === i;
          let cls = "text-white/80 hover:bg-white/10";
          if (sel && z.defekt) cls = "bg-green/30 text-white ring-1 ring-green";
          else if (sel && !z.defekt) cls = "bg-amber/30 text-white ring-1 ring-amber";
          else if (geloest && z.defekt) cls = "bg-green/30 text-white ring-1 ring-green";
          return (
            <button key={i} onClick={() => waehle(i)} disabled={geloest}
              className={"flex items-center gap-2 rounded-lg px-3 py-2 text-left font-mono text-sm transition disabled:cursor-default sm:text-base " + cls}>
              <span className="select-none text-white/40">$</span>
              <span>{z.text}</span>
            </button>
          );
        })}
      </div>
      {gewaehlt !== null && (
        <p className={"mt-4 rounded-2xl px-4 py-3 text-sm leading-relaxed " + (geloest ? "bg-green-soft text-green-dark" : "bg-amber/10 text-amber")}>
          {geloest ? "✅ " + e.feedback : "💡 Diese Zeile läuft eigentlich sauber. Schau die Zahlen genau an."}
        </p>
      )}
      {geloest && (
        <>
          <Fragment frag={frag} />
          <div className="mt-5 flex justify-end"><Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button></div>
        </>
      )}
    </Card>
  );
}

/* ---------- Zahlenfolge ---------- */
function SequenzView({ e, frag, onSolve }: { e: EinsatzSequenz; frag: string; onSolve: (p: number) => void }) {
  const [wert, setWert] = useState("");
  const [status, setStatus] = useState<"offen" | "richtig" | "falsch">("offen");
  const [fehler, setFehler] = useState(0);

  function pruefen() {
    if (wert.trim() !== "" && Number(wert.trim()) === e.loesung) setStatus("richtig");
    else { setStatus("falsch"); setFehler((f) => f + 1); }
  }

  return (
    <Card className="p-8 sm:p-10">
      <Kopf titel={e.titel} />
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <h2 className="mt-4 text-2xl font-bold">{e.frage}</h2>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {e.folge.map((n, i) => (
          <span key={i} className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-line bg-black/5 text-2xl font-bold tabular-nums text-ink">
            {n}
          </span>
        ))}
        <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-dashed border-green/60 bg-green-soft/40 text-2xl font-bold text-green">?</span>
      </div>
      <input
        value={wert}
        inputMode="numeric"
        onChange={(ev) => { setWert(ev.target.value.replace(/[^0-9]/g, "")); setStatus("offen"); }}
        placeholder="Nächste Zahl"
        disabled={status === "richtig"}
        className="mx-auto mt-6 block w-40 rounded-2xl border border-line px-5 py-3 text-center text-xl font-bold tabular-nums outline-none focus:border-green focus:ring-4 focus:ring-green/20"
      />
      {status === "falsch" && <p className="mt-3 rounded-2xl bg-amber/10 px-4 py-3 text-center text-sm text-amber">Noch nicht. Tipp: {e.hinweis}</p>}
      {status === "richtig" && <Fragment frag={frag} />}
      <div className="mt-5 flex justify-end">
        {status === "richtig"
          ? <Button onClick={() => onSolve(punkteFuer(fehler))}>Weiter →</Button>
          : <Button onClick={pruefen} disabled={wert.trim().length === 0}>Prüfen</Button>}
      </div>
    </Card>
  );
}

/* ---------- Master-Code zusammensetzen ---------- */
function MasterCode({ fragmente, wort, onDone }: { fragmente: string[]; wort: string; onDone: () => void }) {
  const [wert, setWert] = useState("");
  const [falsch, setFalsch] = useState(0);

  function pruefen() {
    if (wert.trim().toUpperCase() === wort) onDone();
    else setFalsch((f) => f + 1);
  }

  return (
    <Card className="p-8 text-center sm:p-10">
      <div className="text-4xl">🧩</div>
      <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Setz den Master-Code zusammen</h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">
        Du hast aus jedem Einsatz einen Buchstaben gesammelt. Nimm deinen Block,
        setz sie in der richtigen Reihenfolge zusammen und tipp den Master-Code ein –
        damit fährst du die Systeme der Stadt wieder hoch.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {fragmente.map((_, i) => (
          <span key={i} className="grid h-12 w-12 place-items-center rounded-xl border-2 border-dashed border-green/50 bg-green-soft/40 text-2xl font-bold text-green/70">
            ?
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-soft">{fragmente.length} Buchstaben – von deinem Block ablesen.</p>
      <input
        value={wert}
        onChange={(ev) => setWert(ev.target.value.toUpperCase())}
        placeholder="MASTER-CODE"
        className="mt-4 w-full max-w-xs rounded-2xl border border-line px-5 py-3 text-center text-xl font-bold tracking-[0.3em] outline-none focus:border-green focus:ring-4 focus:ring-green/20"
      />
      {falsch > 0 && (
        <p className="mt-3 text-sm text-amber">
          Noch nicht. {falsch >= 2 ? "Tipp: Lies deine notierten Buchstaben in der Reihenfolge, in der du sie bekommen hast." : "Schau nochmal auf deinen Block."}
        </p>
      )}
      <div className="mt-6 flex justify-center">
        <Button onClick={pruefen} disabled={wert.trim().length === 0}>Stadt wieder online bringen →</Button>
      </div>
    </Card>
  );
}

/* ---------- Finale ---------- */
function Finale({ punkte, max, sekunden, einsaetze, wort, info, onBack }: {
  punkte: number; max: number; sekunden: number; einsaetze: number; wort: string; info: TeamInfo; onBack: () => void;
}) {
  const rang = rangFuer(punkte, max);
  const speed = speedBadge(sekunden, einsaetze);
  const wer = info.team ? (info.name ? `Team ${info.name}` : "Euer Team") : null;
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Confetti />
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-green to-green-dark px-8 py-10 text-center text-white sm:px-10">
          <div className="text-5xl">✅</div>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Stadt wieder online!</h2>
          {wer && <p className="mt-2 text-lg font-semibold text-white">{wer} 💪</p>}
          <p className="mt-3 text-white/90">
            Master-Code <span className="font-bold tabular-nums">{wort}</span> eingegeben – alle Systeme laufen wieder. Stark!
          </p>
        </div>
        <div className="space-y-5 px-8 py-8 text-center sm:px-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line p-5">
              <div className="text-3xl font-bold text-green tabular-nums">{punkte}<span className="text-lg text-ink-soft">/{max}</span></div>
              <div className="mt-1 text-xs text-ink-soft">Punkte</div>
            </div>
            <div className="rounded-2xl border border-line p-5">
              <div className="text-3xl">{rang.emoji}</div>
              <div className="mt-1 text-sm font-semibold text-ink">{rang.titel}</div>
            </div>
            <div className="rounded-2xl border border-line p-5">
              <div className="text-2xl">{speed.emoji}</div>
              <div className="mt-1 text-sm font-semibold text-ink">{speed.titel}</div>
              <div className="mt-0.5 text-xs tabular-nums text-ink-soft">{zeitText(sekunden)} min</div>
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
