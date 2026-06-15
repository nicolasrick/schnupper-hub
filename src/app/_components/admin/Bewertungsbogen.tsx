"use client";

import {
  Teilnehmer, Bewertung, ORGANISATION, formatDatum,
  SKALA_FRAGEN, EIGNUNG_KRITERIEN, EIGNUNG_STUFEN,
} from "@/lib/admin";

export function Bewertungsbogen({
  t, bewertung, onChange, onClose,
}: {
  t: Teilnehmer;
  bewertung: Bewertung;
  onChange: (patch: Partial<Bewertung>) => void;
  onClose: () => void;
}) {
  const setSkala = (key: string, v: string) => onChange({ skala: { ...bewertung.skala, [key]: v } });
  const setEignung = (id: string, v: string) => onChange({ eignung: { ...bewertung.eignung, [id]: v } });

  const kopf = SKALA_FRAGEN.filter((f) => f.gruppe === "kopf");
  const ausfuehrung = SKALA_FRAGEN.filter((f) => f.gruppe === "ausfuehrung");

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-auto bg-black/70 p-4 sm:p-8">
      {/* Werkzeugleiste */}
      <div className="no-print mx-auto mb-4 flex w-full max-w-[210mm] items-center justify-between">
        <button onClick={onClose} className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25">
          ← Schliessen
        </button>
        <button onClick={() => window.print()} className="rounded-full bg-sg-green px-5 py-2 text-sm font-semibold text-white hover:brightness-90">
          🖨 Drucken / Als PDF speichern
        </button>
      </div>

      {/* A4-Dokument */}
      <div className="print-doc mx-auto w-full max-w-[210mm] bg-white p-[16mm] text-[13px] leading-snug text-ink shadow-2xl">
        {/* Kopf */}
        <div className="flex items-start justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ids-logo.svg" alt="Informatikdienste Stadt St. Gallen" className="h-11 w-auto" />
          <p className="text-right text-xs text-ink-soft">Auswertung Schnupperlehre · Vorlage 2023</p>
        </div>
        <div className="mt-2 h-1 w-full rounded" style={{ background: "var(--sg-green)" }} />

        <h1 className="mt-5 text-xl font-bold">Auswertung der Schnupperlehre durch den Betrieb</h1>
        <p className="mt-1 text-xs italic text-ink-soft">Beobachten – Beurteilen – Besprechen</p>

        {/* Betrieb + Jugendliche/r (vorausgefüllt) */}
        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-1 rounded-lg bg-black/[0.03] p-4">
          <Info label="Betrieb" value={ORGANISATION.name} />
          <Info label="Verantwortlich" value={t.betreuer || "Nicolas Rick / Gioele Parenti"} />
          <Info label="Adresse" value="Poststrasse 28, 9000 St. Gallen" />
          <Info label="Beruf" value={ORGANISATION.beruf} />
          <Info label="Jugendliche/r" value={`${t.nachname} ${t.vorname}`.trim() || "—"} />
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="text-xs font-semibold text-ink-soft">Geschnuppert:</span>
            <span className="text-sm">{formatDatum(t.datum) || "—"} bis</span>
            <input
              value={bewertung.datumBis}
              onChange={(e) => onChange({ datumBis: e.target.value })}
              placeholder="Datum"
              className="w-28 border-b border-line bg-transparent text-sm outline-none focus:border-sg-green"
            />
          </div>
        </div>

        {/* Durchgeführte Arbeiten */}
        <Section title="Folgende Arbeiten hat die/der Jugendliche durchgeführt">
          <textarea
            value={bewertung.arbeiten}
            onChange={(e) => onChange({ arbeiten: e.target.value })}
            rows={3}
            className="w-full resize-none rounded border border-line bg-transparent p-2 text-[13px] outline-none focus:border-sg-green"
          />
        </Section>

        {/* Theorie / Praxis */}
        <div className="mt-5 grid grid-cols-2 gap-8">
          {kopf.map((f) => (
            <div key={f.key}>
              <p className="mb-2 text-xs font-semibold">{f.frage}</p>
              <div className="space-y-1">
                {f.optionen.map((o) => (
                  <RadioRow
                    key={o.v} name={f.key} label={o.l}
                    checked={bewertung.skala[f.key] === o.v}
                    onChange={() => setSkala(f.key, o.v)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Wie ausgeführt – 4 Spalten */}
        <Section title="Wie wurden die Arbeiten ausgeführt?">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {ausfuehrung.map((f) => (
              <div key={f.key}>
                <p className="mb-2 text-xs font-semibold">{f.frage}</p>
                <div className="space-y-1">
                  {f.optionen.map((o) => (
                    <RadioRow
                      key={o.v} name={f.key} label={o.l}
                      checked={bewertung.skala[f.key] === o.v}
                      onChange={() => setSkala(f.key, o.v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Verhalten und Eignung – Matrix */}
        <Section title="Verhalten und Eignung">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="w-1/3" />
                {EIGNUNG_STUFEN.map((s) => (
                  <th key={s} className="px-1 pb-1 text-center align-bottom font-semibold text-ink-soft">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EIGNUNG_KRITERIEN.map((k) => (
                <tr key={k.id} className="border-t border-line">
                  <td className="py-1.5 pr-2">{k.label}</td>
                  {EIGNUNG_STUFEN.map((s) => (
                    <td key={s} className="text-center">
                      <input
                        type="radio" name={`eig-${k.id}`}
                        checked={bewertung.eignung[k.id] === s}
                        onChange={() => setEignung(k.id, s)}
                        className="h-3.5 w-3.5 accent-[var(--sg-green)]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Begründung */}
        <Section title="Kurze Begründung">
          <textarea
            value={bewertung.begruendung}
            onChange={(e) => onChange({ begruendung: e.target.value })}
            rows={3}
            className="w-full resize-none rounded border border-line bg-transparent p-2 text-[13px] outline-none focus:border-sg-green"
          />
        </Section>

        {/* Besprochen + Unterschrift */}
        <div className="mt-5 flex items-center gap-4 text-xs">
          <span className="font-semibold">Beurteilung mit dem/der Jugendlichen besprochen?</span>
          {(["ja", "nein"] as const).map((opt) => (
            <RadioRow
              key={opt} name="besprochen" label={opt === "ja" ? "ja" : "nein"}
              checked={bewertung.besprochen === opt}
              onChange={() => onChange({ besprochen: opt })}
              inline
            />
          ))}
        </div>

        <div className="mt-12 flex items-end justify-between text-xs">
          <div>
            <span>Datum: {formatDatum(bewertung.datumBis) || formatDatum(t.datum) || "__________"}</span>
          </div>
          <div className="text-center">
            <div className="h-px w-56 bg-ink/40" />
            <p className="mt-1">Unterschrift verantwortliche Person</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-1">
      <span className="text-xs font-semibold text-ink-soft">{label}:</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--sg-green)" }}>{title}</p>
      {children}
    </div>
  );
}

function RadioRow({
  name, label, checked, onChange, inline,
}: {
  name: string; label: string; checked: boolean; onChange: () => void; inline?: boolean;
}) {
  return (
    <label className={"flex cursor-pointer items-center gap-2 " + (inline ? "" : "text-[13px]")}>
      <input
        type="radio" name={name} checked={checked} onChange={onChange}
        className="h-3.5 w-3.5 accent-[var(--sg-green)]"
      />
      <span>{label}</span>
    </label>
  );
}
