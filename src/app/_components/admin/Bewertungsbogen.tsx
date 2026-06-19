"use client";

import { useEffect, useRef, useState } from "react";
import {
  Teilnehmer, Bewertung, formatDatum,
  SKALA_FRAGEN, EIGNUNG_KRITERIEN, EIGNUNG_STUFEN, generiereBegruendung,
  BEOBACHTUNGEN,
} from "@/lib/admin";
import { Einstellungen } from "@/lib/einstellungen";

// «gut»-Standard fürs Schnell-Ausfüllen
const SCHNELL_SKALA: Record<string, string> = {
  theorie: "gut", praxis: "geschickt",
  genauigkeit: "sorgfaeltig", tempo: "zuegig", ausdauer: "beharrlich", konzentration: "gut_dabei",
};

export function Bewertungsbogen({
  t, bewertung, einstellungen, onChange, onChangeT, onClose,
}: {
  t: Teilnehmer;
  bewertung: Bewertung;
  einstellungen: Einstellungen;
  onChange: (patch: Partial<Bewertung>) => void;
  onChangeT: (patch: Partial<Teilnehmer>) => void;
  onClose: () => void;
}) {
  const setSkala = (key: string, v: string) =>
    onChange({ skala: { ...bewertung.skala, [key]: bewertung.skala[key] === v ? "" : v } });
  const setEignung = (id: string, v: string) =>
    onChange({ eignung: { ...bewertung.eignung, [id]: bewertung.eignung[id] === v ? "" : v } });

  const kopf = SKALA_FRAGEN.filter((f) => f.gruppe === "kopf");
  const ausfuehrung = SKALA_FRAGEN.filter((f) => f.gruppe === "ausfuehrung");
  const autoText = generiereBegruendung(t, bewertung);
  // Begründung erscheint LIVE aus den Ankreuzungen; sobald getippt wird, gilt der eigene Text.
  const begruendungAnzeige = bewertung.begruendung || autoText;

  const name = t.vorname || "Die teilnehmende Person";
  const g = t.geschlecht || "d";
  const addBaustein = (satz: string) =>
    onChange({ begruendung: (begruendungAnzeige.trim() ? begruendungAnzeige.trim() + " " : "") + satz });

  const schnellGut = () =>
    onChange({ skala: { ...SCHNELL_SKALA }, eignung: Object.fromEntries(EIGNUNG_KRITERIEN.map((k) => [k.id, "Gut"])) });
  const leeren = () => onChange({ skala: {}, eignung: {}, begruendung: "", besprochen: "" });

  // KI: macht die Begründung flüssiger und variiert sie (braucht ANTHROPIC_API_KEY auf dem Server).
  const [kiBusy, setKiBusy] = useState(false);
  const [kiFehler, setKiFehler] = useState("");
  async function kiUmformulieren() {
    const quelle = begruendungAnzeige.trim();
    if (!quelle || kiBusy) return;
    setKiBusy(true);
    setKiFehler("");
    try {
      const res = await fetch("/api/umformulieren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quelle, name: t.vorname || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setKiFehler(data?.message || "KI-Umformulieren fehlgeschlagen.");
        return;
      }
      if (data?.text) onChange({ begruendung: data.text });
    } catch {
      setKiFehler("Netzwerkfehler – bitte erneut versuchen.");
    } finally {
      setKiBusy(false);
    }
  }

  return (
    <div className="bw-modal fixed inset-0 z-50 flex flex-col overflow-auto bg-black/70 p-4 sm:p-8">
      <style>{`
        @media print {
          .bw-modal { position: absolute !important; top: 0 !important; left: 0 !important; right: auto !important; bottom: auto !important; width: 100% !important; height: auto !important; overflow: visible !important; background: transparent !important; padding: 0 !important; display: block !important; }
          .bw-doc { position: static !important; inset: auto !important; box-shadow: none !important; margin: 0 auto !important; max-width: 210mm !important; }
        }
      `}</style>

      {/* Werkzeugleiste */}
      <div className="no-print mx-auto mb-4 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-2">
        <button onClick={onClose} className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25">← Schliessen</button>
        <div className="flex flex-wrap gap-2">
          <button onClick={schnellGut} className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25">✓ Schnell: alles «gut»</button>
          <button onClick={leeren} className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25">↺ Leeren</button>
          <button onClick={() => window.print()} className="rounded-full bg-sg-green px-5 py-2 text-sm font-semibold text-white hover:brightness-90">🖨 Drucken / Als PDF</button>
        </div>
      </div>

      {/* A4-Dokument */}
      <div className="print-doc bw-doc mx-auto w-full max-w-[210mm] bg-white px-[16mm] py-[14mm] text-[13px] leading-snug text-ink shadow-2xl">
        {/* Kopf */}
        <div className="flex items-end justify-between border-b-[3px] border-sg-green pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ids-logo.svg" alt="Informatikdienste Stadt St. Gallen" className="h-[58px] w-auto" />
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sg-green">Beobachten · Beurteilen · Besprechen</p>
            <h1 className="mt-0.5 text-[23px] font-extrabold leading-tight tracking-tight">Auswertung der Schnupperlehre</h1>
            <p className="text-[11px] text-ink-soft">{einstellungen.betrieb.beruf} · durch den Betrieb</p>
          </div>
        </div>

        {/* Betrieb / Jugendliche */}
        <div className="mt-3 grid grid-cols-2 gap-x-6">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sg-green">Betrieb</p>
            <Row label="Name" value={einstellungen.betrieb.name} />
            <Row label="Adresse" value={einstellungen.betrieb.adresse} />
            <div className="flex items-baseline gap-2 border-b border-line/70 py-1">
              <span className="w-[80px] shrink-0 text-[10px] font-medium text-ink-soft">Verantwortlich</span>
              <select
                value={t.betreuer || ""}
                onChange={(e) => onChangeT({ betreuer: e.target.value })}
                className="min-w-0 flex-1 cursor-pointer bg-transparent text-[12.5px] font-semibold leading-snug outline-none focus:text-sg-green"
              >
                <option value="">— wählen —</option>
                {einstellungen.verantwortliche.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
                {einstellungen.verantwortliche.length > 1 && (
                  <option value={einstellungen.verantwortliche.join(" / ")}>{einstellungen.verantwortliche.join(" / ")}</option>
                )}
              </select>
            </div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sg-green">Jugendliche/r</p>
            <div className="flex items-baseline gap-2 border-b border-line/70 py-1">
              <span className="w-[80px] shrink-0 text-[10px] font-medium text-ink-soft">Name, Vorname</span>
              <span className="flex flex-1 items-baseline gap-1.5 text-[12.5px] font-semibold leading-snug">
                <input value={t.nachname} onChange={(e) => onChangeT({ nachname: e.target.value })} placeholder="Name"
                  className="min-w-0 flex-1 border-b border-line/60 bg-transparent outline-none placeholder:font-normal placeholder:text-ink-soft/50 focus:border-sg-green" />
                <input value={t.vorname} onChange={(e) => onChangeT({ vorname: e.target.value })} placeholder="Vorname"
                  className="min-w-0 flex-1 border-b border-line/60 bg-transparent outline-none placeholder:font-normal placeholder:text-ink-soft/50 focus:border-sg-green" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 border-b border-line/70 py-1">
              <span className="w-[80px] shrink-0 text-[10px] font-medium text-ink-soft">Schnuppertag(e)</span>
              <input
                value={bewertung.datumBis}
                onChange={(e) => onChange({ datumBis: e.target.value })}
                placeholder={formatDatum(t.datum) || "z. B. 19.06.2026"}
                className="min-w-0 flex-1 border-b border-line/60 bg-transparent text-[12.5px] font-semibold leading-snug outline-none placeholder:font-normal placeholder:text-ink-soft/60 focus:border-sg-green"
              />
            </div>
          </div>
        </div>
        <Row label="Beruf" value={einstellungen.betrieb.beruf} className="mt-0.5" />

        {/* Durchgeführte Arbeiten */}
        <Sech>Folgende Arbeiten hat die/der Jugendliche durchgeführt</Sech>
        <AutoText
          value={bewertung.arbeiten}
          onChange={(v) => onChange({ arbeiten: v })}
          className="w-full resize-none overflow-hidden rounded border border-line bg-transparent p-2 text-[12.5px] leading-relaxed outline-none focus:border-sg-green"
        />

        {/* Theorie / Praxis */}
        <Sech>Wie wurden die Aufgaben angegangen?</Sech>
        <div className="grid grid-cols-2 gap-4 break-inside-avoid">
          {kopf.map((f) => (
            <div key={f.key} className="rounded border border-line p-3">
              <p className="mb-1.5 text-[11px] font-bold text-ink-soft">{f.frage.replace("Wie wurden ", "").replace("?", "")}</p>
              {f.optionen.map((o) => (
                <Opt key={o.v} on={bewertung.skala[f.key] === o.v} label={o.l} onClick={() => setSkala(f.key, o.v)} />
              ))}
            </div>
          ))}
        </div>

        {/* Wie ausgeführt – 4 Spalten */}
        <Sech>Wie wurden die Arbeiten ausgeführt?</Sech>
        <div className="grid grid-cols-4 gap-3 break-inside-avoid">
          {ausfuehrung.map((f) => (
            <div key={f.key} className="rounded border border-line p-3">
              <p className="mb-1.5 text-[11px] font-bold text-ink-soft">{f.frage}</p>
              {f.optionen.map((o) => (
                <Opt key={o.v} on={bewertung.skala[f.key] === o.v} label={o.l} onClick={() => setSkala(f.key, o.v)} />
              ))}
            </div>
          ))}
        </div>

        {/* Verhalten und Eignung – Matrix */}
        <Sech>Verhalten und Eignung</Sech>
        <table className="w-full border-collapse break-inside-avoid text-[11.5px]">
          <thead>
            <tr>
              <th className="w-[36%]" />
              {EIGNUNG_STUFEN.map((s) => (
                <th key={s} className="px-1 pb-1.5 text-center align-bottom text-[9px] font-bold text-ink-soft">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EIGNUNG_KRITERIEN.map((k, i) => (
              <tr key={k.id} className={i % 2 ? "bg-black/[0.025]" : ""}>
                <td className="rounded-l-md border-t border-line py-1.5 pl-2 pr-2 font-medium">{k.label}</td>
                {EIGNUNG_STUFEN.map((s, j) => {
                  const on = bewertung.eignung[k.id] === s;
                  return (
                    <td key={s} className={"border-t border-line text-center " + (j === EIGNUNG_STUFEN.length - 1 ? "rounded-r-md" : "")}>
                      <button onClick={() => setEignung(k.id, s)} className="grid w-full place-items-center py-1">
                        <span className={"grid h-4 w-4 place-items-center rounded border text-[10px] leading-none text-white " + (on ? "border-sg-green bg-sg-green" : "border-ink-soft/40")}>{on ? "✓" : ""}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Kurze Begründung – live aus den Ankreuzungen, frei anpassbar */}
        <div className="break-inside-avoid">
          <Sech>Kurze Begründung</Sech>
          <AutoText
            value={begruendungAnzeige}
            onChange={(v) => onChange({ begruendung: v })}
            placeholder="Kreuze oben an – hier entsteht die Begründung automatisch. Frei anpassbar."
            className="min-h-[3.5rem] w-full resize-none overflow-hidden rounded border border-line bg-transparent p-2 text-[12.5px] leading-relaxed outline-none placeholder:text-ink-soft/60 focus:border-sg-green"
          />
          <div className="no-print mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-soft">Bausteine anfügen:</span>
            {BEOBACHTUNGEN.map((b) => (
              <button
                key={b.id}
                onClick={() => addBaustein(b.satz(name, g))}
                className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-soft transition hover:border-sg-green hover:text-sg-green"
              >
                + {b.label}
              </button>
            ))}
          </div>
          <div className="no-print mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={kiUmformulieren}
              disabled={kiBusy || !begruendungAnzeige.trim()}
              className="rounded-full bg-sg-green px-3 py-1.5 text-[11px] font-semibold text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {kiBusy ? "✨ formuliert …" : "✨ KI: flüssiger formulieren"}
            </button>
            <span className="text-[10px] text-ink-soft/80">macht den Text flüssiger und variiert ihn pro Jugendlichem</span>
            {kiFehler && <span className="w-full text-[11px] font-medium text-sg-green">{kiFehler}</span>}
          </div>
        </div>

        {/* Besprochen + Unterschrift */}
        <div className="mt-4 flex flex-wrap items-center gap-4 break-inside-avoid text-[12px]">
          <span className="font-semibold">Beurteilung mit der/dem Jugendlichen besprochen?</span>
          {(["ja", "nein"] as const).map((opt) => (
            <Opt key={opt} inline on={bewertung.besprochen === opt} label={opt} onClick={() => onChange({ besprochen: bewertung.besprochen === opt ? "" : opt })} />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-10 break-inside-avoid">
          <div className="border-t border-ink/40 pt-1 text-[11px] text-ink-soft">Ort / Datum</div>
          <div className="border-t border-ink/40 pt-1 text-[11px] text-ink-soft">Unterschrift{t.betreuer ? " — " + t.betreuer : " verantwortliche Person"}</div>
        </div>

        <div className="mt-8 flex justify-between border-t border-line pt-2 text-[9px] text-ink-soft">
          <span>{einstellungen.betrieb.name} · Auswertung der Schnupperlehre durch den Betrieb</span>
          <span>interne Beurteilung</span>
        </div>
      </div>
    </div>
  );
}

/** Textarea, die automatisch auf ihren Inhalt wächst → im Druck nichts abgeschnitten. */
function AutoText({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);
  return (
    <textarea ref={ref} value={value} placeholder={placeholder} rows={2}
      onChange={(e) => onChange(e.target.value)} className={className} />
  );
}

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={"flex items-baseline gap-2 border-b border-line/70 py-1 " + className}>
      <span className="w-[80px] shrink-0 text-[10px] font-medium text-ink-soft">{label}</span>
      <span className="flex-1 break-words text-[12.5px] font-semibold leading-snug">{value}</span>
    </div>
  );
}

function Sech({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-4 break-after-avoid border-b border-line/70 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sg-green">
      {children}
    </p>
  );
}

function Opt({ on, label, onClick, inline }: { on: boolean; label: string; onClick: () => void; inline?: boolean }) {
  return (
    <button onClick={onClick} className={"flex items-center gap-2 text-left " + (inline ? "" : "w-full py-[3px]")}>
      <span className={"grid h-[14px] w-[14px] shrink-0 place-items-center rounded-[3px] border text-[9px] leading-none text-white " + (on ? "border-sg-green bg-sg-green" : "border-ink-soft/45")}>{on ? "✓" : ""}</span>
      <span className={"text-[12px] " + (on ? "font-semibold text-ink" : "text-ink/75")}>{label}</span>
    </button>
  );
}
