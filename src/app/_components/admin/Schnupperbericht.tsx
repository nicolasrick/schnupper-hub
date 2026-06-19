"use client";

import { Teilnehmer, BEOBACHTUNGEN, generiereBericht, formatDatum } from "@/lib/admin";
import { Einstellungen } from "@/lib/einstellungen";

export function Schnupperbericht({
  t, einstellungen, onChange, onClose,
}: {
  t: Teilnehmer;
  einstellungen: Einstellungen;
  onChange: (patch: Partial<Teilnehmer>) => void;
  onClose: () => void;
}) {
  const o = einstellungen.betrieb;
  const bericht = t.bericht ?? { beobachtungen: [], freitext: "" };

  function toggle(id: string) {
    const has = bericht.beobachtungen.includes(id);
    onChange({
      bericht: {
        ...bericht,
        beobachtungen: has ? bericht.beobachtungen.filter((x) => x !== id) : [...bericht.beobachtungen, id],
      },
    });
  }

  const absaetze = generiereBericht(t);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-auto bg-black/70 p-4 sm:p-8">
      {/* Steuerung – wird nicht gedruckt */}
      <div className="no-print mx-auto mb-4 w-full max-w-[210mm] space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25">← Schliessen</button>
          <button onClick={() => window.print()} className="rounded-full bg-green px-5 py-2 text-sm font-semibold text-white hover:bg-green-dark">🖨 Drucken / lokal als PDF speichern</button>
        </div>

        <div className="rounded-2xl bg-surface p-5 text-ink shadow-xl">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Anrede:</span>
              {([["w", "Sie"], ["m", "Er"], ["d", "Neutral"]] as const).map(([v, l]) => (
                <label key={v} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input type="radio" name="g" checked={(t.geschlecht || "d") === v} onChange={() => onChange({ geschlecht: v })} className="h-4 w-4 accent-[var(--green)]" />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <p className="mt-4 text-sm font-semibold">Was hast du beobachtet? (Sätze werden automatisch formuliert)</p>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {BEOBACHTUNGEN.map((b) => {
              const on = bericht.beobachtungen.includes(b.id);
              return (
                <label key={b.id} className={"flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition " + (on ? "border-green bg-green-soft text-green-dark" : "border-line hover:border-green/40")}>
                  <input type="checkbox" checked={on} onChange={() => toggle(b.id)} className="h-4 w-4 accent-[var(--green)]" />
                  {b.label}
                </label>
              );
            })}
          </div>

          <label className="mt-4 block text-sm font-medium">Eigener Satz (optional)</label>
          <textarea
            value={bericht.freitext}
            onChange={(e) => onChange({ bericht: { ...bericht, freitext: e.target.value } })}
            rows={2}
            className="mt-1 w-full rounded-2xl border border-line px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-4 focus:ring-green/20"
          />
        </div>
      </div>

      {/* A4-Bericht (wird gedruckt) */}
      <div className="print-doc mx-auto w-full max-w-[210mm] bg-white p-[18mm] text-ink shadow-2xl">
        <div className="flex items-start justify-between border-b-2 border-green pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ids-logo.svg" alt="Informatikdienste Stadt St. Gallen" className="h-12 w-auto" />
          <p className="text-right text-xs text-ink-soft">{o.ort}, {formatDatum(t.datum)}</p>
        </div>

        <h1 className="mt-10 text-3xl font-bold">Schnupperbericht</h1>
        <p className="mt-1 text-sm text-ink-soft">{o.beruf}</p>

        <div className="mt-8 space-y-4 text-[15px] leading-relaxed">
          {absaetze.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-20 flex items-end justify-between">
          <div>
            <div className="h-px w-56 bg-ink/40" />
            <p className="mt-1 text-sm">{t.betreuer || "Berufsbildner/in"}</p>
            <p className="text-xs text-ink-soft">Berufsbildner/in · {o.name}</p>
          </div>
          <p className="text-xs text-ink-soft">{o.kontaktMail}</p>
        </div>
      </div>
    </div>
  );
}
