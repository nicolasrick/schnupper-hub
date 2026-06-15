"use client";

import { useState } from "react";
import { Teilnehmer, mailVorlagen, mailtoLink } from "@/lib/admin";

export function MailVorlagen({ t, onClose }: { t: Teilnehmer; onClose: () => void }) {
  const vorlagen = mailVorlagen(t);
  const [aktiv, setAktiv] = useState(vorlagen[0].id);
  const [kopiert, setKopiert] = useState(false);

  const v = vorlagen.find((x) => x.id === aktiv)!;

  async function kopieren() {
    const inhalt = `Betreff: ${v.betreff}\n\n${v.text}`;
    try {
      await navigator.clipboard.writeText(inhalt);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 1800);
    } catch {
      /* Clipboard evtl. nicht verfügbar */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-surface p-6 text-ink shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Mailvorlagen</h2>
          <button onClick={onClose} className="text-sm text-ink-soft hover:text-ink">✕ Schliessen</button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {vorlagen.map((x) => (
            <button
              key={x.id}
              onClick={() => setAktiv(x.id)}
              className={
                "rounded-full px-4 py-1.5 text-sm font-medium transition " +
                (aktiv === x.id ? "bg-green text-white" : "bg-black/5 text-ink-soft hover:bg-black/10")
              }
            >
              {x.name}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-line">
          <div className="border-b border-line px-4 py-2.5 text-sm">
            <span className="text-ink-soft">Betreff: </span>
            <span className="font-medium">{v.betreff}</span>
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap px-4 py-3 font-sans text-sm leading-relaxed text-ink">
{v.text}
          </pre>
        </div>

        {!t.email && (
          <p className="mt-3 text-xs text-amber">
            ⚠ Keine E-Mail-Adresse erfasst – „In Mail öffnen" hat keinen Empfänger.
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            onClick={kopieren}
            className="rounded-full bg-black/5 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-black/10"
          >
            {kopiert ? "✓ Kopiert" : "📋 Text kopieren"}
          </button>
          <a
            href={mailtoLink(t, v)}
            className="rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
          >
            ✉ In Mail öffnen
          </a>
        </div>
      </div>
    </div>
  );
}
