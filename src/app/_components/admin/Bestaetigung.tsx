"use client";

import {
  Teilnehmer, STATIONEN, ORGANISATION, vollerName, formatDatum,
} from "@/lib/admin";

export function Bestaetigung({ t, onClose }: { t: Teilnehmer; onClose: () => void }) {
  const stationen = STATIONEN.filter((s) => t.stationen.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-auto bg-black/70 p-4 sm:p-8">
      {/* Werkzeugleiste – wird nicht gedruckt */}
      <div className="no-print mx-auto mb-4 flex w-full max-w-[210mm] items-center justify-between">
        <button
          onClick={onClose}
          className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
        >
          ← Schliessen
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-green px-5 py-2 text-sm font-semibold text-white hover:bg-green-dark"
        >
          🖨 Drucken / Als PDF speichern
        </button>
      </div>

      {/* A4-Dokument */}
      <div className="print-doc mx-auto w-full max-w-[210mm] bg-white p-[18mm] text-ink shadow-2xl">
        <div className="flex items-start justify-between border-b-2 border-green pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ids-logo.svg" alt="Informatikdienste Stadt St. Gallen" className="h-12 w-auto" />
          <p className="text-right text-xs text-ink-soft">
            {ORGANISATION.ort}, {formatDatum(t.datum)}
          </p>
        </div>

        <h1 className="mt-10 text-3xl font-bold">Schnupperbestätigung</h1>

        <p className="mt-8 leading-relaxed">
          Wir bestätigen, dass
        </p>
        <p className="my-4 text-2xl font-bold">{vollerName(t)}</p>
        <p className="leading-relaxed">
          {t.schule ? <>({t.schule}) </> : null}
          am <strong>{formatDatum(t.datum)}</strong> einen Schnuppertag im Beruf{" "}
          <strong>{ORGANISATION.beruf}</strong> bei den {ORGANISATION.name} absolviert hat.
        </p>

        {stationen.length > 0 && (
          <div className="mt-8">
            <p className="font-semibold">Bearbeitete Stationen:</p>
            <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2">
              {stationen.map((s) => (
                <li key={s.id} className="flex items-start gap-2 text-sm">
                  <span className="text-green">✓</span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {t.bemerkung && (
          <div className="mt-8">
            <p className="font-semibold">Bemerkung:</p>
            <p className="mt-1 whitespace-pre-line leading-relaxed text-ink-soft">{t.bemerkung}</p>
          </div>
        )}

        <p className="mt-10 leading-relaxed">
          Wir danken {t.vorname || "der teilnehmenden Person"} für das Interesse und den Einsatz
          und wünschen alles Gute für die berufliche Zukunft.
        </p>

        <div className="mt-20 flex items-end justify-between">
          <div>
            <div className="h-px w-56 bg-ink/40" />
            <p className="mt-1 text-sm">{t.betreuer || "Berufsbildner/in"}</p>
            <p className="text-xs text-ink-soft">Berufsbildner/in · {ORGANISATION.name}</p>
          </div>
          <p className="text-xs text-ink-soft">{ORGANISATION.kontaktMail}</p>
        </div>
      </div>
    </div>
  );
}
