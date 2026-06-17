"use client";

import { useState } from "react";
import {
  CHECK_ITEMS, BONUS_ITEMS, TEIL_INFO, CheckErgebnis, KUNDEN, BIT_WERTE,
  CheckBituhr, CheckSequenz, CheckPseudocode, CheckFehler, CheckRanking, CheckTriage, CheckZuordnung, CheckCode, CheckItem,
} from "@/lib/content";
import { Card, Button, Fortschritt } from "./ui";

// AnalyseFlow/Abschluss kennen das Ergebnis weiterhin unter diesem Namen.
export type { CheckErgebnis as AufgabenErgebnis };

interface LosResult { selbststaendig: boolean; tipp: boolean; }
type SolveFn = (r: LosResult) => void;

/** Der Eignungs-Check: durchgezählter Aufgaben-Stream + freiwillige Bonus-Runde.
 *  Jede Aufgabe = ein Screen → der Fortschritt stimmt. Wer eine Hilfe nutzt oder
 *  mehrere Anläufe braucht, zählt nicht als „selbstständig" – das fliesst ins Ergebnis. */
export function EignungsCheck({ onDone }: { onDone: (e: CheckErgebnis) => void }) {
  const N = CHECK_ITEMS.length;
  const B = BONUS_ITEMS.length;
  const OFFER = N + 1;
  // 0 = Intro, 1..N = Pflicht, OFFER = Bonus-Angebot, OFFER+1..OFFER+B = Bonus
  const [schritt, setSchritt] = useState(0);
  const [records, setRecords] = useState<Record<string, LosResult>>({});
  const [bonus, setBonus] = useState(false);

  function finish(rec: Record<string, LosResult>, bonusGemacht: boolean) {
    const selbststaendig = CHECK_ITEMS.filter((i) => rec[i.id]?.selbststaendig).length;
    const tipps = CHECK_ITEMS.filter((i) => rec[i.id]?.tipp).length;
    const teile = [...new Set(CHECK_ITEMS.map((i) => i.teil))];
    const starkeTeile = teile.filter((t) =>
      CHECK_ITEMS.filter((i) => i.teil === t).every((i) => rec[i.id]?.selbststaendig)
    );
    const bonusSelbststaendig = BONUS_ITEMS.filter((i) => rec[i.id]?.selbststaendig).length;
    onDone({ total: N, selbststaendig, tipps, starkeTeile, bonusGemacht, bonusTotal: bonusGemacht ? B : 0, bonusSelbststaendig });
  }

  function loese(id: string, r: LosResult) {
    const rec = { ...records, [id]: r };
    setRecords(rec);
    if (schritt < N) setSchritt(schritt + 1);
    else if (schritt === N) setSchritt(OFFER);          // letzte Pflicht → Bonus-Angebot
    else if (schritt < OFFER + B) setSchritt(schritt + 1); // Bonus → nächste Bonus
    else finish(rec, true);                              // letzte Bonus → fertig
  }

  let item: CheckItem | null = null;
  if (schritt >= 1 && schritt <= N) item = CHECK_ITEMS[schritt - 1];
  else if (schritt > OFFER && schritt <= OFFER + B) item = BONUS_ITEMS[schritt - OFFER - 1];

  const istBonus = schritt > OFFER;
  const teilLabel = istBonus ? "Vertiefung" : item?.teil ?? "Logik & Muster";
  const fortschritt = istBonus ? (schritt - OFFER - 1) / B : (schritt - 1) / N;
  const zaehler = istBonus ? `Vertiefung ${schritt - OFFER} von ${B}` : `Aufgabe ${schritt} von ${N}`;

  return (
    <div className="mx-auto w-full max-w-2xl">
      {item && (
        <div className="mb-4 px-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-white/90">{teilLabel}</span>
            <span className="whitespace-nowrap text-sm font-medium text-white/60">{zaehler}</span>
          </div>
          <Fortschritt value={fortschritt} tone="dark" />
          <p className="mt-3 text-sm leading-relaxed text-white/70">{TEIL_INFO[teilLabel]}</p>
        </div>
      )}

      {schritt === 0 && <Intro total={N} onNext={() => setSchritt(1)} />}

      {item?.typ === "sequenz" && <SequenzView key={item.id} e={item} kicker={teilLabel} onNext={(r) => loese(item!.id, r)} />}
      {item?.typ === "bituhr" && <BituhrView key={item.id} e={item} kicker={teilLabel} onNext={(r) => loese(item!.id, r)} />}
      {item?.typ === "pseudocode" && <PseudocodeView key={item.id} e={item} kicker={teilLabel} onNext={(r) => loese(item!.id, r)} />}
      {item?.typ === "fehler" && <FehlerView key={item.id} e={item} kicker={teilLabel} onNext={(r) => loese(item!.id, r)} />}
      {item?.typ === "ranking" && <RankingView key={item.id} e={item} kicker={teilLabel} onNext={(r) => loese(item!.id, r)} />}
      {item?.typ === "triage" && <TriageView key={item.id} e={item} kicker={teilLabel} onNext={(r) => loese(item!.id, r)} />}
      {item?.typ === "zuordnung" && <ZuordnungView key={item.id} e={item} kicker={teilLabel} onNext={(r) => loese(item!.id, r)} />}
      {item?.typ === "code" && <CodeView key={item.id} e={item} kicker={teilLabel} onNext={(r) => loese(item!.id, r)} />}

      {schritt === OFFER && (
        <BonusAngebot
          onJa={() => { setBonus(true); setSchritt(OFFER + 1); }}
          onNein={() => finish(records, false)}
        />
      )}
    </div>
  );
}

function Kicker({ text }: { text: string }) {
  return <p className="text-sm font-semibold uppercase tracking-wide text-green">{text}</p>;
}

/** „Ich komme nicht weiter" – zeigt einen Tipp. Wird im Ergebnis vermerkt. */
function Hilfe({ text, offen, onOeffnen }: { text: string; offen: boolean; onOeffnen: () => void }) {
  if (offen) {
    return <p className="mt-4 rounded-2xl bg-amber/10 px-4 py-3 text-sm leading-relaxed text-amber">💡 {text}</p>;
  }
  return (
    <button onClick={onOeffnen} className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-green hover:text-green">
      💡 Tipp anzeigen
    </button>
  );
}

function Intro({ total, onNext }: { total: number; onNext: () => void }) {
  return (
    <Card className="p-8 text-center sm:p-10">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-green">Eignungs-Check</p>
      <h2 className="mt-2 text-3xl font-bold">Berufsrelevante Fähigkeiten</h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">
        {total} Aufgaben in vier Bereichen – logisches Denken, strukturiertes
        Vorgehen, Priorisieren und Urteilsvermögen im Anwendersupport. Vor jeder
        Aufgabe steht, worum es geht und warum es im Beruf zählt. Kein Vorwissen
        nötig: Kommst du nicht weiter, kannst du einen Tipp abrufen – ob du Hilfe
        brauchst, fliesst in deine Auswertung ein.
      </p>
      <div className="mt-8 flex justify-center">
        <Button onClick={onNext}>Check starten →</Button>
      </div>
    </Card>
  );
}

function BonusAngebot({ onJa, onNein }: { onJa: () => void; onNein: () => void }) {
  return (
    <Card className="p-8 text-center sm:p-10">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-green">Vertiefung</p>
      <h2 className="mt-2 text-3xl font-bold">Pflichtteil abgeschlossen</h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">
        Möchtest du dich an einigen anspruchsvolleren Aufgaben versuchen? Sie sind
        freiwillig und gehen bewusst tiefer. Auch wenn du sie nicht alle löst,
        zeigt dein Vorgehen schon viel.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={onJa}>Weitermachen →</Button>
        <Button variant="ghost" onClick={onNein}>Hier abschliessen</Button>
      </div>
    </Card>
  );
}

/* ---------- Zahlenfolge ---------- */
function SequenzView({ e, kicker, onNext }: { e: CheckSequenz; kicker: string; onNext: SolveFn }) {
  const [wert, setWert] = useState("");
  const [status, setStatus] = useState<"offen" | "richtig" | "falsch">("offen");
  const [fehler, setFehler] = useState(0);
  const [tipp, setTipp] = useState(false);
  const tippText = e.tipp ?? e.hinweis;

  function pruefen() {
    if (wert.trim() !== "" && Number(wert.trim()) === e.loesung) setStatus("richtig");
    else { setStatus("falsch"); setFehler((f) => f + 1); }
  }

  return (
    <Card className="p-8 sm:p-10">
      <Kicker text={kicker} />
      <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{e.frage}</h2>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {e.folge.map((n, i) => (
          <span key={i} className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-line bg-black/5 text-2xl font-bold tabular-nums text-ink">{n}</span>
        ))}
        <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-dashed border-green/60 bg-green-soft/40 text-2xl font-bold text-green">?</span>
      </div>
      <input value={wert} inputMode="numeric"
        onChange={(ev) => { setWert(ev.target.value.replace(/[^0-9]/g, "")); setStatus("offen"); }}
        placeholder="Nächste Zahl" disabled={status === "richtig"}
        className="mx-auto mt-6 block w-40 rounded-2xl border border-line px-5 py-3 text-center text-xl font-bold tabular-nums outline-none focus:border-green focus:ring-4 focus:ring-green/20" />
      {status === "falsch" && <p className="mt-3 rounded-2xl bg-amber/10 px-4 py-3 text-center text-sm text-amber">Noch nicht – probier weiter.</p>}
      {status === "richtig" && <p className="mt-3 rounded-2xl bg-green-soft px-4 py-3 text-center text-sm text-green-dark">Richtig. {e.hinweis}</p>}
      {status !== "richtig" && <Hilfe text={tippText} offen={tipp} onOeffnen={() => setTipp(true)} />}
      <div className="mt-5 flex justify-end">
        {status === "richtig"
          ? <Button onClick={() => onNext({ selbststaendig: fehler === 0 && !tipp, tipp })}>Weiter →</Button>
          : <Button onClick={pruefen} disabled={wert.trim().length === 0}>Prüfen</Button>}
      </div>
    </Card>
  );
}

/* ---------- Bit-Uhr (Binär) ---------- */
function BituhrView({ e, kicker, onNext }: { e: CheckBituhr; kicker: string; onNext: SolveFn }) {
  const [bits, setBits] = useState<boolean[]>(BIT_WERTE.map(() => false));
  const [status, setStatus] = useState<"offen" | "richtig" | "falsch">("offen");
  const [fehler, setFehler] = useState(0);
  const [tipp, setTipp] = useState(false);
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
      <Kicker text={kicker} />
      <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Stelle die Zahl {e.ziel} ein</h2>
      <p className="mt-2 leading-relaxed text-ink-soft">
        Computer kennen nur «an» und «aus». Schalte die richtigen Lämpchen an – ihre Werte zusammengezählt sollen {e.ziel} ergeben.
      </p>
      <div className="mt-7 flex justify-center gap-2 sm:gap-3">
        {BIT_WERTE.map((w, i) => (
          <button key={w} onClick={() => toggle(i)}
            className={"flex w-14 flex-col items-center gap-2 rounded-2xl border-2 py-3 transition sm:w-16 " + (bits[i] ? "border-amber bg-amber/15" : "border-line bg-white hover:border-amber/40")}>
            <span className={"h-7 w-7 rounded-full transition " + (bits[i] ? "bg-amber shadow-[0_0_14px] shadow-amber/70" : "bg-black/10")} />
            <span className="text-sm font-bold tabular-nums text-ink">{w}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 text-lg">
        <span className="text-ink-soft">Summe:</span>
        <span className={"rounded-lg px-3 py-1 font-bold tabular-nums " + (status === "richtig" ? "bg-green-soft text-green-dark" : "bg-black/5 text-ink")}>{summe}</span>
      </div>
      {status === "falsch" && <p className="mt-4 rounded-2xl bg-amber/10 px-4 py-3 text-center text-sm text-amber">Noch nicht – {summe < e.ziel ? "es fehlt noch etwas." : "das ist zu viel."}</p>}
      {status === "richtig" && <p className="mt-4 rounded-2xl bg-green-soft px-4 py-3 text-center text-sm text-green-dark">Korrekt: {BIT_WERTE.filter((_, i) => bits[i]).join(" + ")} = {e.ziel}.</p>}
      {status !== "richtig" && <Hilfe text={e.tipp ?? e.hinweis} offen={tipp} onOeffnen={() => setTipp(true)} />}
      <div className="mt-6 flex justify-end">
        {status === "richtig"
          ? <Button onClick={() => onNext({ selbststaendig: fehler === 0 && !tipp, tipp })}>Weiter →</Button>
          : <Button onClick={pruefen} disabled={summe === 0}>Prüfen</Button>}
      </div>
    </Card>
  );
}

/* ---------- Pseudocode lesen ---------- */
function PseudocodeView({ e, kicker, onNext }: { e: CheckPseudocode; kicker: string; onNext: SolveFn }) {
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [fehler, setFehler] = useState(0);
  const [tipp, setTipp] = useState(false);
  const geloest = gewaehlt !== null && e.optionen[gewaehlt].richtig;

  function waehle(i: number) {
    if (geloest) return;
    setGewaehlt(i);
    if (!e.optionen[i].richtig) setFehler((f) => f + 1);
  }

  return (
    <Card className="p-8 sm:p-10">
      <Kicker text={kicker} />
      <h2 className="mt-2 text-2xl font-bold leading-snug">{e.frage}</h2>
      <div className="mt-5 grid gap-1 rounded-2xl bg-[#1a1a1a] p-4 font-mono text-sm text-white/90 sm:text-base">
        {e.zeilen.map((z, i) => (
          <div key={i} className="flex gap-3"><span className="select-none tabular-nums text-white/35">{i + 1}</span><span className="whitespace-pre">{z}</span></div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {e.optionen.map((o, i) => {
          const sel = gewaehlt === i;
          let cls = "border-line bg-white hover:border-green/50 hover:bg-green-soft/40";
          if (sel && o.richtig) cls = "border-green bg-green-soft";
          else if (sel && !o.richtig) cls = "border-amber bg-amber/10";
          return (
            <button key={i} onClick={() => waehle(i)} disabled={geloest}
              className={"rounded-2xl border px-4 py-4 text-center text-xl font-bold tabular-nums transition disabled:cursor-default " + cls}>{o.text}</button>
          );
        })}
      </div>
      {geloest && <p className="mt-4 rounded-2xl bg-green-soft px-4 py-3 text-sm leading-relaxed text-green-dark">✅ {e.aufloesung}</p>}
      {gewaehlt !== null && !geloest && <p className="mt-4 rounded-2xl bg-amber/10 px-4 py-3 text-sm text-amber">Nicht ganz – geh die Schritte nochmal von oben durch.</p>}
      {!geloest && <Hilfe text={e.tipp ?? "Geh die Schritte von oben nach unten durch und rechne Schritt für Schritt mit."} offen={tipp} onOeffnen={() => setTipp(true)} />}
      {geloest && <div className="mt-5 flex justify-end"><Button onClick={() => onNext({ selbststaendig: fehler === 0 && !tipp, tipp })}>Weiter →</Button></div>}
    </Card>
  );
}

/* ---------- Fehler finden ---------- */
function FehlerView({ e, kicker, onNext }: { e: CheckFehler; kicker: string; onNext: SolveFn }) {
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [fehler, setFehler] = useState(0);
  const [tipp, setTipp] = useState(false);
  const geloest = gewaehlt !== null && e.zeilen[gewaehlt].defekt;

  function waehle(i: number) {
    if (geloest) return;
    setGewaehlt(i);
    if (!e.zeilen[i].defekt) setFehler((f) => f + 1);
  }

  return (
    <Card className="p-8 sm:p-10">
      <Kicker text={kicker} />
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
              <span className="select-none text-white/40">$</span><span>{z.text}</span>
            </button>
          );
        })}
      </div>
      {gewaehlt !== null && (
        <p className={"mt-4 rounded-2xl px-4 py-3 text-sm leading-relaxed " + (geloest ? "bg-green-soft text-green-dark" : "bg-amber/10 text-amber")}>
          {geloest ? "✅ " + e.feedback : "💡 Diese Zeile läuft eigentlich sauber. Schau die Zahlen genau an."}
        </p>
      )}
      {!geloest && <Hilfe text={e.tipp ?? "Schau die Zahlen genau an – welche kann es so gar nicht geben?"} offen={tipp} onOeffnen={() => setTipp(true)} />}
      {geloest && <div className="mt-5 flex justify-end"><Button onClick={() => onNext({ selbststaendig: fehler === 0 && !tipp, tipp })}>Weiter →</Button></div>}
    </Card>
  );
}

/* ---------- Ranking / Einordnen ---------- */
function RankingView({ e, kicker, onNext }: { e: CheckRanking; kicker: string; onNext: SolveFn }) {
  const [order, setOrder] = useState<number[]>(e.start);
  const [status, setStatus] = useState<"offen" | "richtig" | "falsch">("offen");
  const [fehler, setFehler] = useState(0);
  const [tipp, setTipp] = useState(false);

  function move(pos: number, dir: -1 | 1) {
    if (status === "richtig") return;
    const ziel = pos + dir;
    if (ziel < 0 || ziel >= order.length) return;
    const next = [...order];
    [next[pos], next[ziel]] = [next[ziel], next[pos]];
    setOrder(next);
    setStatus("offen");
  }
  function pruefen() {
    if (order.every((v, i) => v === i)) setStatus("richtig");
    else { setStatus("falsch"); setFehler((f) => f + 1); }
  }

  return (
    <Card className="p-8 sm:p-10">
      <Kicker text={kicker} />
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>
      <h2 className="mt-4 text-2xl font-bold leading-snug">{e.frage}</h2>
      <div className="mt-3 flex justify-between px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        <span>↑ {e.hintOben}</span><span>{e.hintUnten} ↓</span>
      </div>
      <div className="mt-2 grid gap-2.5">
        {order.map((itemIdx, pos) => {
          const fertig = status === "richtig";
          return (
            <div key={itemIdx} className={"flex items-center gap-3 rounded-2xl border px-4 py-3 transition " + (fertig ? "border-green bg-green-soft" : "border-line bg-white")}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/5 text-sm font-bold tabular-nums text-ink-soft">{pos + 1}</span>
              <span className="flex-1 text-base font-medium leading-snug text-ink">{e.items[itemIdx]}</span>
              {!fertig && (
                <span className="flex shrink-0 flex-col gap-1">
                  <button onClick={() => move(pos, -1)} disabled={pos === 0} className="grid h-7 w-7 place-items-center rounded-lg border border-line text-ink-soft transition hover:border-green hover:text-green disabled:opacity-30">↑</button>
                  <button onClick={() => move(pos, 1)} disabled={pos === order.length - 1} className="grid h-7 w-7 place-items-center rounded-lg border border-line text-ink-soft transition hover:border-green hover:text-green disabled:opacity-30">↓</button>
                </span>
              )}
            </div>
          );
        })}
      </div>
      {status === "falsch" && <p className="mt-4 rounded-2xl bg-amber/10 px-4 py-3 text-sm text-amber">Noch nicht ganz – verschieb die Karten und prüf nochmal.</p>}
      {status === "richtig" && <p className="mt-4 rounded-2xl bg-green-soft px-4 py-3 text-sm leading-relaxed text-green-dark">✅ {e.erklaerung}</p>}
      {status !== "richtig" && <Hilfe text={e.tipp ?? "Was richtet den grössten Schaden an / muss zuerst geprüft werden? Das gehört nach oben."} offen={tipp} onOeffnen={() => setTipp(true)} />}
      <div className="mt-5 flex justify-end">
        {status === "richtig"
          ? <Button onClick={() => onNext({ selbststaendig: fehler === 0 && !tipp, tipp })}>Weiter →</Button>
          : <Button onClick={pruefen}>Prüfen</Button>}
      </div>
    </Card>
  );
}

/* ---------- Triage / Entscheidung ---------- */
function TriageView({ e, kicker, onNext }: { e: CheckTriage; kicker: string; onNext: SolveFn }) {
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [fehler, setFehler] = useState(0);
  const [tipp, setTipp] = useState(false);
  const option = gewaehlt !== null ? e.optionen[gewaehlt] : null;
  const geloest = option?.richtig ?? false;

  function waehle(i: number) {
    if (geloest) return;
    setGewaehlt(i);
    if (!e.optionen[i].richtig) setFehler((f) => f + 1);
  }

  return (
    <Card className="p-8 sm:p-10">
      <Kicker text={kicker} />
      {e.intro && <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 font-medium">{e.intro}</p>}
      <h2 className="mt-4 text-2xl font-bold leading-snug">{e.frage}</h2>
      <div className="mt-5 grid gap-3">
        {e.optionen.map((o, i) => {
          const sel = gewaehlt === i;
          let cls = "border-line bg-white hover:border-green/50 hover:bg-green-soft/40";
          if (sel && o.richtig) cls = "border-green bg-green-soft";
          else if (sel && !o.richtig) cls = "border-amber bg-amber/10";
          return (
            <button key={i} onClick={() => waehle(i)} disabled={geloest}
              className={"rounded-2xl border px-5 py-4 text-left text-base font-medium transition disabled:cursor-default " + cls}>{o.text}</button>
          );
        })}
      </div>
      {option && (
        <p className={"mt-4 rounded-2xl px-4 py-3 text-sm leading-relaxed " + (option.richtig ? "bg-green-soft text-green-dark" : "bg-amber/10 text-amber")}>
          {option.richtig ? "✅ " : "💡 "}{option.feedback}
        </p>
      )}
      {!geloest && e.tipp && <Hilfe text={e.tipp} offen={tipp} onOeffnen={() => setTipp(true)} />}
      {geloest && <div className="mt-5 flex justify-end"><Button onClick={() => onNext({ selbststaendig: fehler === 0 && !tipp, tipp })}>Weiter →</Button></div>}
    </Card>
  );
}

/* ---------- Zuordnung ---------- */
function ZuordnungView({ e, kicker, onNext }: { e: CheckZuordnung; kicker: string; onNext: SolveFn }) {
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [fehler, setFehler] = useState(0);
  const [tipp, setTipp] = useState(false);
  const richtig = gewaehlt === e.richtig;

  function waehle(k: string) {
    if (richtig) return;
    setGewaehlt(k);
    if (k !== e.richtig) setFehler((f) => f + 1);
  }

  return (
    <Card className="p-8 sm:p-10">
      <Kicker text={kicker} />
      <h2 className="mt-2 text-2xl font-bold leading-snug">Welche Kundin passt zu diesem Auftrag?</h2>
      <p className="mt-3 rounded-2xl bg-black/5 px-4 py-3 text-base font-medium text-ink">«{e.auftrag}»</p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {KUNDEN.map((k) => {
          const sel = gewaehlt === k;
          let cls = "border-line bg-white hover:border-green/50";
          if (sel && richtig) cls = "border-green bg-green-soft text-green-dark";
          else if (sel && !richtig) cls = "border-amber bg-amber/10 text-amber";
          else if (richtig && k === e.richtig) cls = "border-green bg-green-soft text-green-dark";
          return (
            <button key={k} onClick={() => waehle(k)} disabled={richtig}
              className={"rounded-full border px-5 py-2.5 text-base font-medium transition disabled:cursor-default " + cls}>{k}</button>
          );
        })}
      </div>
      {gewaehlt && (
        <p className={"mt-5 rounded-2xl px-4 py-3 text-sm leading-relaxed " + (richtig ? "bg-green-soft text-green-dark" : "bg-amber/10 text-amber")}>
          {richtig ? "✅ " + e.erklaerung : "💡 Nicht ganz – versuch es nochmal."}
        </p>
      )}
      {!richtig && <Hilfe text={e.tipp ?? "Überleg, wer solche Geräte im Alltag wirklich braucht."} offen={tipp} onOeffnen={() => setTipp(true)} />}
      {richtig && <div className="mt-5 flex justify-end"><Button onClick={() => onNext({ selbststaendig: fehler === 0 && !tipp, tipp })}>Weiter →</Button></div>}
    </Card>
  );
}

/* ---------- Datei auf dem PC finden ---------- */
function CodeView({ e, kicker, onNext }: { e: CheckCode; kicker: string; onNext: SolveFn }) {
  const [wert, setWert] = useState("");
  const [status, setStatus] = useState<"offen" | "richtig" | "falsch">("offen");
  const [fehler, setFehler] = useState(0);
  const [tipp, setTipp] = useState(false);

  function pruefen() {
    const v = wert.trim().toLowerCase();
    if (v.length > 0 && e.loesung.some((l) => l.toLowerCase() === v)) setStatus("richtig");
    else { setStatus("falsch"); setFehler((f) => f + 1); }
  }

  return (
    <Card className="p-8 sm:p-10">
      <Kicker text={kicker} />
      <h2 className="mt-2 text-2xl font-bold leading-snug">{e.frage}</h2>
      <input
        value={wert}
        onChange={(ev) => { setWert(ev.target.value); setStatus("offen"); }}
        placeholder="Codewort eingeben"
        disabled={status === "richtig"}
        className="mt-5 w-full rounded-2xl border border-line px-5 py-3 text-lg outline-none focus:border-green focus:ring-4 focus:ring-green/20"
      />
      {status === "falsch" && <p className="mt-3 rounded-2xl bg-amber/10 px-4 py-3 text-sm text-amber">Noch nicht gefunden. Tipp: {e.hinweis}</p>}
      {status === "richtig" && <p className="mt-3 rounded-2xl bg-green-soft px-4 py-3 text-sm text-green-dark">✅ Gefunden – stark!</p>}
      {status !== "richtig" && <Hilfe text={e.tipp ?? e.hinweis} offen={tipp} onOeffnen={() => setTipp(true)} />}
      <div className="mt-5 flex justify-end">
        {status === "richtig"
          ? <Button onClick={() => onNext({ selbststaendig: fehler === 0 && !tipp, tipp })}>Weiter →</Button>
          : <Button onClick={pruefen} disabled={wert.trim().length === 0}>Prüfen</Button>}
      </div>
    </Card>
  );
}
